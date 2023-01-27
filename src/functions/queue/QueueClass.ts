import { ChildProcess, fork } from 'child_process';
import { QueueJob } from '../../database/queue/client';
import { confDb, queDb } from '../../database/config';
import { AppState, useSelector } from '../../state/redux';
import Logger from '../logger';

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
	pendingRemove = false;
	isDisabled = true;
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
		return this.forks.find(w => !w.running);
	}

	createWorker() {
		Logger.log({
			name: 'queue',
			message: `Starting ${this.name} worker ${this.forks.length}`,
			level: 'info',
		});
		this.forks.push({
			id: this.forks.length,
			running: false,
			worker: fork(`${__dirname}/worker`),
			job: <QueueJob>{},
		});

		this.run();
	}

	removeWorker() {
		if (this.forks.some(w => !w.running)) {
			const Worker = this.forks.find(w => !w.running);
			if (!Worker) return;

			this.deleteWorker(Worker);
		} else {
			this.pendingRemove = true;
		}
	}

	deleteWorker(Worker: Worker) {
		if (!Worker) return;

		Worker.worker.kill(2);

		this.forks = this.forks.filter(w => w.id != Worker.id);
	}

	setWorkers(workers: number) {
		if (workers > this.workers) {
			for (let i = 0; i < workers - this.workers; i++) {
				this.createWorker();
			}
			this.workers = workers;
		} else {
			for (let i = 0; i < this.workers - workers; i++) {
				this.removeWorker();
			}
			this.workers = workers;
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

		try {
			const job = await queDb.queueJob.create({
				data: {
					queue: this.name,
					runAt: null,
					priority: args?.priority ?? 2,
					taskId: args.task?.id ?? 'manual',
					payload: JSON.stringify({ file, fn, args }),
				},
			});

			return job;

		} catch (error) {
			console.log(error);
		}

	}

	async remove(id: number) {
		try {
			return await queDb.queueJob.delete({
				where: {
					id: id,
				},
			});
		} catch (error) {
			setTimeout(async () => {
				return await queDb.queueJob.delete({
					where: {
						id: id,
					},
				}).catch(() => null);
			}, 2000);
		}
	}

	async cancel(id: number) {
		const job = await queDb.queueJob.delete({
			where: {
				id: id,
			},
		});
		if (!job) return;

		const Worker = this.forks.find(w => w.job.id == job.id);
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
					priority: 'asc',
				},
			],
		});
	}

	async running(id: number) {
		try {
			return await queDb.queueJob.update({
				where: {
					id: id,
				},
				data: {
					runAt: new Date(),
				},
			});
		} catch (error) {
			return null;
		}
	}

	async failed(id: number, error: any) {
		if (!error?.code) {
			return await queDb.queueJob.update({
				where: {
					id: id,
				},
				data: {
					runAt: null,
					error: error
						? JSON.stringify(error, null, 2)
						: 'unknown',
				},
			});
		}
		return await queDb.queueJob.update({
			where: {
				id: id,
			},
			data: {
				failedAt: new Date(),
				error: error
					? JSON.stringify(error, null, 2)
					: 'unknown',
			},
		});

	}

	async retry(id?: number) {
		return await queDb.queueJob.updateMany({
			where: id
				? {
					id: id,
				}
				: {},
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
				result: JSON.stringify(data, null, 2),
				finishedAt: new Date(),
			},
		});
	}

	stop() {
		this.isDisabled = true;
	}

	state() {
		return this.isDisabled
			? 'stopped'
			: 'running';
	}

	start() {
		this.isDisabled = false;

		for (let i = this.forks.length; i < this.workers; i++) {
			this.createWorker();
		}
	}

	async run() {
		if (this.isDisabled) return;

		const Worker = this.forks.find(w => !w.running);
		if (!Worker) return;

		const job = await this.next();

		if (!job || this.runningJobs.includes(job.id)) {
			setTimeout(async () => {
				await this.run();
			}, 1500);
			return;
		}

		this.runningJobs.push(job.id);

		Worker.running = true;
		Worker.job = job;

		await this.running(job.id);

		if (job.taskId) {
			try {
				const runningTask = await confDb.runningTask.findFirst({
					where: {
						id: job.taskId,
					},
				});
				if (runningTask?.id) {
					await confDb.runningTask.update({
						where: {
							id: runningTask.id,
						},
						data: {
							title: `${runningTask?.title?.replace(/\n.+/u, '')}\n${JSON.parse(job.payload as string).args.folder}` ?? 'Downloading images',
						},
					});
				}
			} catch (error) {
				//
			}
		}

		Worker.worker.send(job);

		Worker.worker.once('message', async (message: any) => {

			const socket = useSelector((state: AppState) => state.system.socket);

			const runningTask = await confDb.runningTask.findFirst({
				where: {
					id: message.result?.task?.id,
				},
			}).catch(e => console.log(e));

			if (runningTask?.value == 100) {
				await confDb.runningTask.delete({
					where: {
						id: runningTask.id,
					},
				}).catch(e => console.log(e));
			}

			socket.emit('tasks', runningTask);

			if (runningTask?.title.includes('library') && message.job.queue == 'queue') {
				socket.emit('update_content', ['libraries']);
			}

			if (message?.error) {
				await this.failed(job.id, message.result);
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
			}, 1500);
		});
	}
}

function _getCallerFile() {
	const originalFunc = Error.prepareStackTrace;

	let callerFile;
	try {
		const error: any = new Error();

		Error.prepareStackTrace = function (err, stack) {
			return stack;
		};

		const currentFile = error.stack.shift().getFileName();

		while (error.stack.length) {
			callerFile = error.stack.shift().getFileName();

			if (currentFile !== callerFile) break;
		}
	} catch (e) {
		//
	}

	Error.prepareStackTrace = originalFunc;

	return callerFile;
}
