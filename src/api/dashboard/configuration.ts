import { AppState, useSelector } from '@server/state/redux';
import { ConfigData, ConfigParams, ResponseStatus } from '@server/types/server';
import { Request, Response } from 'express';
import { setSecureExternalPort, setSecureInternalPort } from '@server/state/redux/system/actions';

import Logger from '@server/functions/logger';
import reboot from '@server/functions/reboot';
import { setDeviceName } from '@server/state/redux/config/actions';
import storeConfig from '@server/functions/storeConfig';
import ping from '@server/loaders/ping';

export const configuration = (req: Request, res: Response) => {

	try {
		const data = globalThis.mediaDb.query.configuration.findMany();

		const configuration: any = {};

		data.map((c: any) => {
			try {
				return (configuration[c.key] = JSON.parse(c.value));
			} catch (error) {
				return (configuration[c.key] = c.value);
			}
		});

		return res.json(configuration);
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'configuration',
			color: 'magentaBright',
			message: `Error getting configuration: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong getting configuration: ${error}`,
		});
	}

};

export const createConfiguration = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {

	await storeConfig(req.body, req.user.sub)
		.then(() => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: 'Created configuration.',
			});

			return res.json({
				status: 'ok',
				message: 'Successfully created configuration.',
			});
		})
		.catch(() => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: 'Error creating configuration',
			});

			return res.json({
				status: 'ok',
				message: 'Something went wrong creating configuration',
			});
		});
};

export const updateConfiguration = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {

	const body: ConfigParams = req.body;
	let needsReboot = false;
	let updateRegistry = false;

	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	const cron = useSelector((state: AppState) => state.config.cronWorker);
	const data = useSelector((state: AppState) => state.config.dataWorker);
	const request = useSelector((state: AppState) => state.config.requestWorker);
	const encoder = useSelector((state: AppState) => state.config.encoderWorker);
	const deviceName = useSelector((state: AppState) => state.config.deviceName);

	await storeConfig(body as unknown as ConfigData, req.user.sub)
		.then(() => {
			if (deviceName != body.deviceName) {
				updateRegistry = true;
			}
			body.queueWorkers != null && queue.setWorkers(body.queueWorkers);
			body.cronWorkers != null && cron.setWorkers(body.cronWorkers);
			body.dataWorkers != null && data.setWorkers(body.dataWorkers);
			body.requestWorkers != null && request.setWorkers(body.requestWorkers);
			body.encoderWorkers != null && encoder.setWorkers(body.encoderWorkers);
			body.deviceName != null && setDeviceName(body.deviceName);

			if (body.secureInternalPort && secureInternalPort != body.secureInternalPort) {
				needsReboot = true;
			}

			if (updateRegistry) {
				ping();
			}

			body.secureInternalPort != null && setSecureInternalPort(body.secureInternalPort);
			body.secureExternalPort != null && setSecureExternalPort(body.secureExternalPort);

			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: 'Updated configuration.',
			});

			if (needsReboot) {
				Logger.log({
					level: 'info',
					name: 'configuration',
					color: 'magentaBright',
					message: 'Changes require restart, restarting...',
				});

				reboot();
			}

			return res.json({
				status: 'ok',
				message: 'Successfully updated configuration.',
			});
		})
		.catch(() => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: 'Error updating configuration',
			});

			return res.status(400).json({
				status: 'ok',
				message: 'Something went wrong updating configuration',
			});
		});
};
