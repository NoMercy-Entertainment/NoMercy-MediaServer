import { ChildProcess, fork } from 'child_process';

import { AppState, useSelector } from '@server/state/redux';
import Logger from '../logger';
import { and, asc, eq, isNull, lt } from 'drizzle-orm';
import { QueueJob, queueJobs } from '@server/db/queue/schema/queueJobs';
import { runningTasks } from '@server/db/media/schema/runningTasks';
import { configuration } from '@server/db/media/schema/configuration';

interface DatabaseQueueProps {
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

export class DatabaseQueue {
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

	maxAttempts = 2;

	constructor({ name = 'default', keepJobs = false, workers = 0 }: DatabaseQueueProps) {
		this.name = name;
		this.keepJobs = keepJobs;
		this.workers = workers;

		try {

			const attempts = globalThis.mediaDb.select().from(configuration)
				.where(eq(configuration.key, 'maxAttempts'))
				.get()?.value;

			this.maxAttempts = attempts
				? parseInt(attempts, 10)
				: 2;

			globalThis.queueDb.update(queueJobs)
				.set({
					runAt: null,
				})
				.where(lt(queueJobs.attempts, this.maxAttempts))
				.run();

		} catch (error) {
			//
		}

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
			worker: fork(`${__dirname}/databaseWorker`),
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

		Logger.log({
			name: 'queue',
			message: `Removing ${this.name} worker ${this.forks.length}`,
			level: 'info',
		});

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
		return this;
	}

	jobs() {
		return globalThis.queueDb.select().from(queueJobs)
			.where(eq(queueJobs.queue, this.name))
			.all();
	}

	add({ file, fn, args }: { file?: string; fn: string; args?: any; }) {
		if (!file) {
			file = _getCallerFile();
		}

		const job = globalThis.queueDb.insert(queueJobs)
			.values({
				queue: this.name,
				runAt: null,
				priority: args?.priority ?? 2,
				task_id: args.task?.id ?? 'manual',
				payload: JSON.stringify({ file, fn, args }),
			})
			.returning()
			.get();

		return job;

	}

	remove(job: QueueJob) {
		return globalThis.queueDb.delete(queueJobs)
			.where(eq(queueJobs.id, job.id))
			.run();
	}

	cancel(job: QueueJob) {
		const qj = globalThis.queueDb.delete(queueJobs)
			.where(eq(queueJobs.id, job.id))
			.run();

		if (!qj) return;

		const Worker = this.forks.find(w => w.job.id == job.id);
		if (!Worker) return;

		Worker.worker.kill(2);

		this.deleteWorker(Worker);

		this.createWorker();
	}

	clear() {
		return globalThis.queueDb.delete(queueJobs)
			.run();
	}

	next() {
		return globalThis.queueDb.select().from(queueJobs)
			.where(
				and(
					eq(queueJobs.queue, this.name),
					isNull(queueJobs.runAt),
					lt(queueJobs.attempts, this.maxAttempts)
				)
			)
			.orderBy(asc(queueJobs.priority))
			.get();
	}

	running(job: QueueJob) {
		return globalThis.queueDb.update(queueJobs)
			.set({
				runAt: Date.now(),
				attempts: job.attempts + 1,
			})
			.where(eq(queueJobs.id, job.id))
			.returning()
			.get();
	}

	failed(job: QueueJob, error: any) {
		if (!error?.code) {
			return globalThis.queueDb.update(queueJobs)
				.set({
					runAt: null,
					failedAt: Date.now(),
					error: error
						? JSON.stringify(error ?? 'unknown', null, 2)
						: 'unknown',
				})
				.where(eq(queueJobs.id, job.id))
				.run();
		}
		return globalThis.queueDb.update(queueJobs)
			.set({
				failedAt: Date.now(),
				error: error
					? JSON.stringify(error ?? 'unknown', null, 2)
					: 'unknown',
			})
			.where(eq(queueJobs.id, job.id))
			.returning()
			.get();
	}

	retry(job: QueueJob) {
		return globalThis.queueDb.update(queueJobs)
			.set({
				runAt: null,
			})
			.where(eq(queueJobs.id, job.id))
			.returning()
			.get();
	}

	finished(job: QueueJob, data: any) {
		return globalThis.queueDb.update(queueJobs)
			.set({
				result: JSON.stringify(data ?? 'unknown', null, 2),
				finishedAt: Date.now(),
			})
			.where(eq(queueJobs.id, job.id))
			.returning()
			.get();
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

	sendMessageTo(worker: Worker, message: any) {
		console.log('send message to worker', worker, message);
		worker.worker.send(message);
	}

	sendMessage(message: any) {
		for (const worker of this.forks) {
			console.log('send message to worker', message);
			// eslint-disable-next-line no-loop-func
			worker.worker.send(message, (error) => {
				console.log('error', error);
			});
		}
	}

	run() {

		if (this.isDisabled) {
			setTimeout(() => {
				this.run();
			}, 1000 * 10);
			return;
		};

		const Worker = this.forks.find(w => !w.running);
		if (!Worker) {
			// console.log('no free worker');
			setTimeout(() => {
				this.run();
			}, 1000 * 10);
			return;
		};
		// console.log('free worker', Worker.id);

		Worker.running = true;

		const job = this.next();

		if (!job?.id || this.runningJobs.includes(job.id)) {
			Worker.running = false;
			// console.log('no job? ', job?.id);
			setTimeout(() => {
				this.run();
			}, 1000 * 10);
			return;
		}

		Worker.job = job;

		this.runningJobs.push(job.id);

		this.running(job);

		if (job.task_id) {
			try {
				const runningTask = globalThis.mediaDb.select().from(runningTasks)
					.where(eq(runningTasks.id, job.task_id))
					.get();
				if (runningTask?.id) {
					// while (await checkDbLock()) {
					// 	//
					// }
					// await confDb.runningTask.update({
					// 	where: {
					// 		id: runningTask.id,
					// 	},
					// 	data: {
					// 		title: `${runningTask?.title?.replace(/\n.+/u, '')}\n${JSON.parse(job.payload as string).args.folder}` ?? 'Downloading images',
					// 	},
					// });
				}
			} catch (error) {
				//
			}
		}

		const socket = useSelector((state: AppState) => state.system.socket);

		Logger.log({
			name: 'queue',
			message: `Running job ${job?.id} on ${this.name} worker ${Worker.id}`,
			level: 'verbose',
		});

		Worker.worker.send({ type: 'job', job });

		Worker.worker.on('message', (message: any) => {
			if (message.type !== 'encoder-progress' && message.type !== 'dependency') {
				// console.log(message);
			}

			if (message.type == 'encoder-progress') {
				socket.emit('encoder-progress', message.data);
			} else if (message.type == 'custom') {
				socket.emit(message.event, message.data);
			} else if (message.type == 'encoder-end') {
				socket.emit('encoder-clear');
			} else if (message.type == 'encoder-paused') {
				socket.emit('encoder-paused', message.data);
			} else if (message.type == 'encoder-resumed') {
				socket.emit('encoder-resumed', message.data);
			} else if (message.type == 'dependency') {
				//
			} else {
				// console.log(message);

				const task = globalThis.mediaDb.select().from(runningTasks)
					.where(eq(runningTasks.id, message.job?.queue?.task?.id))
					.get();

				if (task?.value == 100) {
					globalThis.mediaDb.delete(runningTasks)
						.where(eq(runningTasks.id, task.id as string))
						.run();
				}

				if (task && (message.job?.queue == 'queue' || message.job?.queue == 'encoder')) {
					socket.emit('tasks', task);
					socket.emit('update_content', ['library']);
				}

				if (message?.error) {
					// console.log(message?.error);
					this.failed(job, message.result);
				}
				if (this.keepJobs) {
					this.finished(job, message.result.data);
				} else {
					this.remove(job);
				}

				Worker.running = false;
				Worker.job = <QueueJob>{};
				this.runningJobs = this.runningJobs.filter(j => j != job.id);

				if (this.workers < this.forks.length) {
					this.deleteWorker(Worker);
				}
				setTimeout(() => {
					this.run();
				}, 1000 * 10);
			}
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
