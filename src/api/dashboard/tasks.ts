import { AppState, useSelector } from '@/state/redux';
import { Request, Response } from 'express';
import { confDb, queDb } from '../../database/config';

import Logger from '../../functions/logger';

export const tasks = (req: Request, res: Response) => {
	confDb.runningTask
		.findMany({})
		.then((data) => {
			return res.json(
				data.map(d => ({
					...d,
				}))
			);
		})
		.catch((error) => {
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
		});
};

export const deleteTask = async (req: Request, res: Response) => {

	const { id } = req.body;

	await queDb.queueJob.deleteMany({
		where: {
			id: id,
		},
	})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'app',
				color: 'magentaBright',
				message: `Error getting server tasks: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong getting server tasks: ${error}`,
			});
		});

	await confDb.runningTask
		.delete({
			where: {
				id: id,
			},
		})
		.then(() => {
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
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'app',
				color: 'magentaBright',
				message: `Error getting server tasks: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong getting server tasks: ${error}`,
			});
		});

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

	queDb.queueJob.findMany({
		where: {
			queue: 'encoder',
		},
	})
		.then((data) => {
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
		})
		.catch((error) => {
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
		});

};
