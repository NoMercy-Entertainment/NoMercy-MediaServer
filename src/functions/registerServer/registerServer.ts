import { AppState, useSelector } from '@server/state/redux';
import { deviceId, platform } from '../system';

import Logger from '@server/functions/logger';
import { ServerRegisterResponse } from '@server/types/api';
import { applicationVersion } from '@server/state';
import apiClient from '../apiClient/apiClient';
import { tempServer } from '../auth/helpers';
import { aquireToken } from '../auth/login';

const registerServer = async () => {
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const external_ip = useSelector((state: AppState) => state.system.external_ip);
	const deviceName = useSelector((state: AppState) => state.config.deviceName);
	const internal_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != '' && !isNaN(parseInt(process.env.DEFAULT_PORT as string, 10))
		? parseInt(process.env.DEFAULT_PORT as string, 10)
		: 7636;
	const external_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != '' && !isNaN(parseInt(process.env.DEFAULT_PORT as string, 10))
		? parseInt(process.env.DEFAULT_PORT as string, 10)
		: 7636;

	const serverData = {
		server_id: deviceId,
		server_name: deviceName,
		internal_ip: internal_ip,
		internal_port: internal_port,
		external_ip: external_ip,
		external_port: external_port,
		server_version: applicationVersion,
		platform: platform.toTitleCase(),
	};

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Registering server, this takes a moment...',
	});

	await apiClient()
		.post<ServerRegisterResponse>('server/register', serverData)
		.then(async () => {
			await assignServer();
		})
		.catch(async (error) => {
			error = true;
			if (error.response) {
				Logger.log({
					level: 'info',
					name: 'setup',
					color: 'blueBright',
					message: error?.response?.data?.message ?? error,
				});
			}

			if ((typeof error == 'boolean' && error == false) || error?.response?.data?.message) {
				await aquireToken().then(async () => {
					tempServer(internal_port);
					await registerServer();
				});
			}
		});
};

export default registerServer;

export const assignServer = async () => {

	const external_ip = useSelector((state: AppState) => state.system.external_ip);
	const serverData = {
		server_id: deviceId,
		external_ip: external_ip,
	};

	await apiClient()
		.post('server/assign', serverData)
		.then(() => {
			Logger.log({
				level: 'info',
				name: 'register',
				color: 'blueBright',
				message: 'Server validated',
			});
		})
		.catch(({ response }) => {
			Logger.log({
				level: 'error',
				name: 'register',
				color: 'red',
				message: JSON.stringify(response?.data ?? response, null, 2),
			});
		});
};
