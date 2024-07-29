import { AppState, useSelector } from '@server/state/redux';

import Logger from '../functions/logger';
import { ServerPingResponse } from '@server/types/api';
import apiClient from '../functions/apiClient';
import { deviceId, platform } from '../functions/system';
import { eq } from 'drizzle-orm';
import { configuration } from '@server/db/media/schema/configuration';
import { applicationVersion } from '@server/state';

export default async () => {
	setInterval(async () => {
		await ping();
	}, 1 * 60 * 1000);
	await ping();
};

const ping = async () => {
	const server_name = globalThis.mediaDb.query.configuration.findFirst({
		where: eq(configuration.key, 'server_name'),
	});
	const deviceName = useSelector((state: AppState) => state.config.deviceName);

	const data = {
		internal_ip: useSelector((state: AppState) => state.system.internal_ip),
		internal_port: useSelector((state: AppState) => state.system.secureInternalPort),
		external_port: useSelector((state: AppState) => state.system.secureExternalPort),
		server_version: applicationVersion,
		server_name: server_name?.value ?? deviceName,
		server_id: deviceId,
		online: true,
		platform: platform,
	};

	await apiClient()
		.post<ServerPingResponse>('server/ping', data)
		.then(({ data }) => {
			Logger.log({
				level: 'verbose',
				name: 'ping',
				color: 'blueBright',
				message: data.message,
			});
		})
		.catch((error) => {
			if (error?.response) {
				Logger.log({
					level: 'error',
					name: 'ping',
					color: 'red',
					message: error.response.data.message,
				});
			}
			// process.exit(1);
		});
};
