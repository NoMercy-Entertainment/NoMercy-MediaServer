import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express';

import Logger from '@server/functions/logger';
import { eq } from 'drizzle-orm';
import { runningTasks } from '@server/db/media/schema/runningTasks';
import { queueJobs } from '@server/db/queue/schema/queueJobs';

export const tasks = (req: Request, res: Response) => {

	try {
		const data = globalThis.mediaDb.query.runningTasks.findMany();
		return res.json(
			data.map(d => ({
				...d,
			}))
		);

	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting server tasks: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting server tasks: ${error}`,
		});
	}
};

export const deleteTask = (req: Request, res: Response) => {

	const { id } = req.body;

	try {
		mediaDb.delete(runningTasks)
			.where(eq(runningTasks.id, id))
			.run();

		Logger.log({
			level: 'info',
			name: 'app',
			color: 'magentaBright',
			message: 'Deleted task successfully',
		});
		return res.json({
			status: 'ok',
			message: 'Deleted task successfully',
		});
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'app',
			color: 'magentaBright',
			message: `Error deleting server tasks: ${error}`,
		});
		return res.json({
			status: 'error',
			message: `Something went wrong deleting server tasks: ${error}`,
		});

	}
};

export const pauseTasks = (req: Request, res: Response) => {

	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.stop();

	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.stop();

	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.stop();

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.stop();

	Logger.log({
		level: 'info',
		name: 'app',
		color: 'magentaBright',
		message: 'Paused all task processing',
	});
	return res.json({
		status: 'ok',
		message: 'Paused all task processing',
	});
};

export const resumeTasks = (req: Request, res: Response) => {

	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.start();

	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.start();

	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.start();

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.start();

	Logger.log({
		level: 'info',
		name: 'app',
		color: 'magentaBright',
		message: 'Resumed all task processing',
	});
	return res.json({
		status: 'ok',
		message: 'Resumed all task processing',
	});

};

export const runningTaskWorkers = (req: Request, res: Response) => {

	let workers = 0;

	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	if (queueWorker.state() == 'running') {
		workers += 1;
	}

	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	if (cronWorker.state() == 'running') {
		workers += 1;
	}

	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	if (dataWorker.state() == 'running') {
		workers += 1;
	}

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	if (requestWorker.state() == 'running') {
		workers += 1;
	}

	return res.json({
		status: 'ok',
		workers: workers,
	});

};

export const encoderQueue = (req: Request, res: Response) => {

	try {
		const data = globalThis.queueDb.query.queueJobs.findMany({
			where: eq(queueJobs.queue, 'encoder'),
		});

		return res.json(
			data.map((d) => {
				const args = JSON.parse(d.payload ?? '{}')?.args;
				const data = (args.onDemand
					? args.onDemand
					: args);

				return {
					id: d.id,
					fullTitle: data.fullTitle,
					videoStreams: data.streams.video.map(v => `${v.width}x${v.height}`).join(', '),
					audioStreams: data.streams.audio.map(a => a.language).join(', '),
					subtitleStreams: data.streams.subtitle.map(s => s.language).join(', '),
					hasGpu: data.hasGpu,
					isHDR: data.isHDR,
					libraryId: data.library.id,
					libraryName: data.library.name,
					libraryType: data.library.type,
					image: data.episode?.still ?? data.movie?.poster ?? null,
				};
			})
		);

	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting encoder queue: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting encoder queue: ${error}`,
		});

	}

};
