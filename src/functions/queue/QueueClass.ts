import { ChildProcess, fork } from 'child_process';
import { QueueJob } from '../../database/queue/client';
import { queDb } from '../../database/config';

interface QueueProps {
	name?: string;
	keepJobs?: boolean;
	workers?: number;
}
interface Worker {
	id: number;
	running: boolean;
	worker: ChildProcess;
	job: QueueJob;
}

export class Queue {
	name: string;
	keepJobs: boolean;
	workers: number;
	pendingRemove: boolean = false;
	isDisabled: boolean = true;
	runningJobs: number[] = [];
	forks: {
		id: number;
		running: boolean;
		worker: ChildProcess;
		job: QueueJob;
	}[] = [];

	constructor({ name = 'default', keepJobs = false, workers = 0 }: QueueProps) {
		this.name = name;
		this.keepJobs = keepJobs;
		this.workers = workers;
	}

	hasFreeWorker() {
		return this.forks.find((w) => !w.running);
	}

	createWorker() {
		this.forks.push({
			id: this.forks.length,
			running: false,
			worker: fork(`${__dirname}/worker`),
			job: <QueueJob>{}
		});

		this.run();
	}

	removeWorker() {
		if (this.forks.some((w) => !w.running)) {
			const Worker = this.forks.find((w) => !w.running);
			if (!Worker) return;

			this.deleteWorker(Worker);
		} else {
			this.pendingRemove = true;
		}
	}

	deleteWorker(Worker: Worker){
		if (!Worker) return;

		Worker.worker.kill(2);

		this.forks = this.forks.filter((w) => w.id != Worker.id);
	}

	setWorkers(workers: number) {
		if ((workers + 1) > this.workers) {
			for (let i = 0; i < workers - this.workers; i++) {
				this.createWorker();
			}
			this.workers = workers;
		} else {
			for (let i = 0; i < this.workers - (workers + 1); i++) {
				this.removeWorker();
			}
			this.workers = (workers + 1);
		}
	}

	async jobs() {
		return await queDb.queueJob.findMany({
			where: {
				queue: this.name,
			},
		});
	}

	async add({ file, fn, args }: { file?: string; fn: string; args?: any }) {
		if (!file) {
			file = _getCallerFile();
		}

		return await queDb.queueJob.create({
			data: {
				queue: this.name,
				runAt: null,
				payload: JSON.stringify({ file, fn, args }),
				priority: 2,
			},
		});
	}

	async remove(id: number) {
		try {
			return await queDb.queueJob.deleteMany({
				where: {
					id: id,
				},
			});
		} catch (error) {
			setTimeout(async () => {
				return await queDb.queueJob.deleteMany({
					where: {
						id: id,
					},
				});
			}, 2000);
		}
	}

	async cancel(id: number) {
		const job =  await queDb.queueJob.delete({
			where: {
				id: id,
			},
		});
		if(!job) return;
		
		const Worker = this.forks.find((w) => w.job.id == job.id);
		if (!Worker) return;

		Worker.worker.kill(2);
		
		this.deleteWorker(Worker);

		this.createWorker();


	}

	async clear() {
		return await queDb.queueJob.deleteMany();
	}

	async next() {
		return await queDb.queueJob.findFirst({
			where: {
				queue: this.name,
				runAt: null,
			},
			orderBy: [
				{
					createdAt: 'asc',
				},
				{
					priority: 'desc',
				},
			],
		});
	}

	async running(id: number) {
		return await queDb.queueJob.update({
			where: {
				id: id,
			},
			data: {
				runAt: new Date(),
			},
		});
	}

	async failed(id: number, error: any) {
		if(!error?.code) {
			return await queDb.queueJob.update({
				where: {
					id: id,
				},
				data: {
					runAt: null,
					error: error ? JSON.stringify(error, null,2) : 'unknown',
				},
			});
		} else {
			return await queDb.queueJob.update({
				where: {
					id: id,
				},
				data: {
					failedAt: new Date(),
					error: error ? JSON.stringify(error, null,2) : 'unknown',
				},
			});
		}
	}

	async retry(id?: number) {
		return await queDb.queueJob.updateMany({
			where: id ? {
				id: id,
			} : {},
			data: {
				runAt: null,
			},
		});
	}

	async finished(id: number, data: any) {
		await queDb.queueJob.update({
			where: {
				id: id,
			},
			data: {
				result: JSON.stringify(data, null,2),
				finishedAt: new Date(),
			},
		});
	}

	stop() {
		this.isDisabled = true;
		this.forks = [];
	}

	start() {
		this.isDisabled = false;

		for (let i = 0; i < this.workers; i++) {
			this.createWorker();
		}
	}

	async run() {
		if (this.isDisabled) return;

		const Worker = this.forks.find((w) => !w.running);
		if (!Worker) return;

		const job = await this.next();

		if (!job || this.runningJobs.includes(job.id)) {
			return this.run();
		}
		
		this.runningJobs.push(job.id);

		Worker.running = true;
		Worker.job = job;

		await this.running(job.id);

		Worker.worker.send(job);

		Worker.worker.once('message', async (message: any) => {

			// console.log(job.id, message);
			if (!message?.result?.success || message?.result?.error || message.error) {
				await this.failed(job.id, message.result ?? message?.result?.error ?? message.error);
			} else if (this.keepJobs) {
				await this.finished(job.id, message.result.data);
			} else {
				await this.remove(job.id);
			}

			Worker.running = false;
			Worker.job = <QueueJob>{};
			this.runningJobs = this.runningJobs.filter(j => j != job.id);

			if (this.workers < this.forks.length) {
				this.deleteWorker(Worker);
			}
			setTimeout(async () => {
				await this.run();
			}, 2000);
		});
	}
}

function _getCallerFile() {
	let originalFunc = Error.prepareStackTrace;

	let callerfile;
	try {
		let error: any = new Error();
		let currentfile;

		Error.prepareStackTrace = function (err, stack) {
			return stack;
		};

		currentfile = error.stack.shift().getFileName();

		while (error.stack.length) {
			callerfile = error.stack.shift().getFileName();

			if (currentfile !== callerfile) break;
		}
	} catch (e) {}

	Error.prepareStackTrace = originalFunc;

	return callerfile;
}
