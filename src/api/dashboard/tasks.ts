import { AppState, useSelector } from "../../state/redux";
import { Request, Response } from "express";
import { confDb, queDb } from "../../database/config";

import Logger from "../../functions/logger";

export const tasks = async (req: Request, res: Response) => {
	confDb.runningTask
		.findMany({})
		.then((data) => {
			return res.json(
				data.map((d) => ({
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

	const {id} = req.body;

	await queDb.queueJob.deleteMany({
		where: {
			taskId: id
		}
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
                id: id
            }
        })
		.then(() => {
			Logger.log({
				level: 'info',
				name: 'app',
				color: 'magentaBright',
				message: `Deleted task successfully`,
			});
			return res.json({
				status: 'ok',
				message: `Deleted task successfully`,
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

export const pauseTasks = async (req: Request, res: Response) => {

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
		message: `Paused all task processing`,
	});
	return res.json({
		status: 'ok',
		message: `Paused all task processing`,
	});
}

export const resumeTasks = async (req: Request, res: Response) => {

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
		message: `Resumed all task processing`,
	});
	return res.json({
		status: 'ok',
		message: `Resumed all task processing`,
	});

}

export const runningTaskWorkers = async (req: Request, res: Response) => {

	let workers = 0;

	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	if(queueWorker.state() == 'running'){
		workers += 1;
	}

	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	if(cronWorker.state() == 'running'){
		workers += 1;
	}
	
	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	if(dataWorker.state() == 'running'){
		workers += 1;
	}

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	if(requestWorker.state() == 'running'){
		workers += 1;
	}
	
	return res.json({
		status: 'ok',
		workers: workers,
	});

}