import { ChildProcess, fork } from 'child_process';

import Logger from '../logger';
import { configuration } from '@server/db/media/schema/configuration';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import events, { EventEmitter } from 'events';

interface SyncQueueProps {
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

interface QueueJob {
	id: string;
	queue: string;
	task_id: string;
	runAt: string | number | null;
	payload: {
		file: string;
		fn: string;
		args: any;
	};
	result: string | null;
	error: string | null;
	progress: number;
	priority: number;
	attempts: number;
	finishedAt: string | number | null;
	failedAt: string | number | null;
	created_at: string | number;
	updated_at: string | number;
}

export class SyncQueue extends EventEmitter {
	name: string;
	keepJobs: boolean;
	workers: number;
	pendingRemove = false;
	isDisabled = true;
	runningJobs: string[] = [];
	forks: {
		id: number;
		running: boolean;
		worker: ChildProcess;
		job: QueueJob;
	}[] = [];

	jobs: QueueJob[] = new Array<QueueJob>();

	myEmitter = new events.EventEmitter();

	maxAttempts = 2;
	delay = 0;

	constructor({ name = 'default', keepJobs = false, workers = 0 }: SyncQueueProps) {
		super();

		this.name = name;
		this.keepJobs = keepJobs;
		this.workers = workers;

		this.myEmitter.setMaxListeners(20);

		try {

			const attempts = globalThis.mediaDb.select().from(configuration)
				.where(eq(configuration.key, 'maxAttempts'))
				.get()?.value;

			this.maxAttempts = attempts
				? parseInt(attempts, 10)
				: 2;
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
			worker: fork(`${__dirname}/syncWorker`),
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
				setTimeout(() => {
					this.createWorker();
				}, 1000 * i);
			}
		} else {
			for (let i = this.workers; i < this.workers - workers; i++) {
				this.removeWorker();
			}
		}

		this.workers = workers;
		
		return this;
	}

	add({ file, fn, args }: { file?: string; fn: string; args?: any; }) {
		if (!file) {
			file = _getCallerFile();
		}

		const newJob: QueueJob = {
			id: createId(),
			queue: this.name,
			runAt: null,
			priority: args?.priority ?? 2,
			task_id: args.task?.id ?? 'manual',
			payload: { file: file as string, fn, args },
			attempts: 0,
			finishedAt: null,
			failedAt: null,
			created_at: Date.now(),
			updated_at: Date.now(),
			result: null,
			error: null,
			progress: 0,
		};

		this.jobs.push(newJob);

		return newJob;

	}

	remove(job: QueueJob) {
		this.jobs = this.jobs.filter(j => j.id != job.id);
		return job;
	}

	cancel(job: QueueJob) {
		const qj = this.jobs.find(j => j.id == job.id);

		this.jobs = this.jobs.filter(j => j.id != job.id);

		if (!qj) return;

		const Worker = this.forks.find(w => w.job.id == job.id);
		if (!Worker) return;

		Worker.worker.kill(2);

		this.deleteWorker(Worker);

		this.createWorker();
	}

	clear() {
		return this.jobs = [];
	}

	next() {
		return this.jobs.find(j => !j.runAt && j.attempts < this.maxAttempts);
	}

	running(job: QueueJob) {

		const newJob = {
			...this.jobs.find(j => j.id == job.id)!,
			runAt: Date.now(),
			attempts: job.attempts + 1,
		};

		this.jobs = [
			...this.jobs.filter(j => j.id != job.id),
			newJob,
		];

		return newJob;
	}

	failed(job: QueueJob, error: any) {
		if (!error?.code) {

			const newJob = {
				...this.jobs.find(j => j.id == job.id)!,
				runAt: null,
				failedAt: Date.now(),
				error: error
					? error ?? 'unknown'
					: 'unknown',
			};

			this.jobs = [
				...this.jobs.filter(j => j.id != job.id)!,
				newJob,
			];
		}

		const newJob = {
			...this.jobs.find(j => j.id == job.id)!,
			failedAt: Date.now(),
			error: error
				? error ?? 'unknown'
				: 'unknown',
		};

		this.jobs = [
			...this.jobs.filter(j => j.id != job.id)!,
			newJob,
		];

		return newJob;
	}

	retry(job: QueueJob) {

		const newJob = {
			...this.jobs.find(j => j.id == job.id)!,
			runAt: null,
		};

		this.jobs = [
			...this.jobs.filter(j => j.id != job.id),
			newJob,
		];

		return newJob;
	}

	finished(job: QueueJob, data: any) {
		const newJob = {
			...this.jobs.find(j => j.id == job.id)!,
			result: data ?? 'unknown',
			finishedAt: Date.now(),
		};

		this.jobs = [
			...this.jobs.filter(j => j.id != job.id),
			newJob,
		];

		return newJob;
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
			}, this.delay);
			return;
		};

		const Worker = this.forks.find(w => !w.running);
		if (!Worker) {
			// console.log('no free worker');
			setTimeout(() => {
				this.run();
			}, this.delay);
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
			}, this.delay);
			return;
		}

		Worker.job = job;

		this.runningJobs.push(job.id);

		this.running(job);

		Logger.log({
			name: 'queue',
			message: `Running job ${job?.id} on ${this.name} worker ${Worker.id}`,
			level: 'verbose',
		});

		Worker.worker.send({ type: 'job', job });

		const workerCallback = (message: any) => {
			if (message.type === 'dependency') {
				// console.log(message);
			} else {
				Worker.worker.off('message', workerCallback);
				this.emit(job.id, message);

				this.remove(job);

				Worker.running = false;
				Worker.job = <QueueJob>{};
				this.runningJobs = this.runningJobs.filter(j => j != job.id);

				if (this.workers < this.forks.length) {
					this.deleteWorker(Worker);
				}
				setTimeout(() => {
					this.run();
				}, this.delay);
			}
		}

		Worker.worker.on('message', workerCallback);
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
