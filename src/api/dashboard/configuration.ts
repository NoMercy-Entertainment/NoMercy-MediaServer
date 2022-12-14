import { confDb } from '../../database/config';
import { Request, Response } from 'express';
import Logger from '../../functions/logger';
import { ConfigData, ConfigParams, ResponseStatus } from 'types/server';
import storeConfig from '../../functions/storeConfig';
import { KAuthRequest } from 'types/keycloak';
import { AppState, useSelector } from '../../state/redux';
import { setDeviceName } from '../../state/redux/config/actions';
import { setSecureExternalPort, setSecureInternalPort } from '../../state/redux/system/actions';
import reboot from '../../functions/reboot/reboot';

export const configuration = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	await confDb.configuration
		.findMany()
		.then((data) => {
			const configuration: any = {};

			data.map((c: any) => {
				try {
					return (configuration[c.key] = JSON.parse(c.value));
				} catch (error) {
					return (configuration[c.key] = c.value);
				}
			});

			return res.json(configuration);
		})
		.catch((error) => {
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
		});
};

export const createConfiguration = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	await storeConfig(req.body, user)
		.then(async (data) => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: `Created configuration.`,
			});

			return res.json({
				status: 'ok',
				message: `Successfully created configuration.`,
			});
		})
		.catch(() => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: `Error creating configuration`,
			});

			return res.json({
				status: 'ok',
				message: `Something went wrong creating configuration`,
			});
		});
};

export const updateConfiguration = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const body: ConfigParams = req.body;
	let needsReboot = false;

	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	const cron = useSelector((state: AppState) => state.config.cronWorker);

	await storeConfig(body as unknown as ConfigData, user)
		.then(async () => {
			queue.setWorkers(body.queueWorkers);
			cron.setWorkers(body.cronWorkers);
			setDeviceName(body.deviceName);

			if (secureInternalPort != body.secureInternalPort) {
				needsReboot = true;
			}

			setSecureInternalPort(body.secureInternalPort);
			setSecureExternalPort(body.secureExternalPort);

			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: `Updated configuration.`,
			});

			if (needsReboot) {
				Logger.log({
					level: 'info',
					name: 'configuration',
					color: 'magentaBright',
					message: `Changes require restart, restarting...`,
				});

				reboot();
			}

			return res.json({
				status: 'ok',
				message: `Successfully updated configuration.`,
			});
		})
		.catch(() => {
			Logger.log({
				level: 'info',
				name: 'configuration',
				color: 'magentaBright',
				message: `Error updating configuration`,
			});

			return res.json({
				status: 'ok',
				message: `Something went wrong updating configuration`,
			});
		});
};
