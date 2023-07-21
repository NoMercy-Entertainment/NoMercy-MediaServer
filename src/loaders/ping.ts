import { AppState, useSelector } from '@server/state/redux';

import Logger from '../functions/logger';
import { ServerPingResponse } from '@server/types/api';
import axios from '../functions/axios';
import { deviceId } from '../functions/system';
import { setOwner } from '@server/state/redux/system/actions';
import { eq } from 'drizzle-orm';
import { configuration } from '@server/db/media/schema/configuration';

export default async () => {
	setInterval(async () => {
		await ping();
	}, 1 * 60 * 1000);
	await ping();
};

const ping = async () => {
	const server_name = await globalThis.mediaDb.query.configuration.findFirst({ where: eq(configuration.key, 'server_name') });
	const deviceName = useSelector((state: AppState) => state.config.deviceName);

	const data = {
		internal_ip: useSelector((state: AppState) => state.system.internal_ip),
		internal_port: useSelector((state: AppState) => state.system.secureInternalPort),
		external_port: useSelector((state: AppState) => state.system.secureExternalPort),
		server_version: useSelector((state: AppState) => state.system.server_version),
		server_name: server_name?.value ?? deviceName,
		server_id: deviceId,
		online: true,
	};

	await axios()
		.post<ServerPingResponse>('https://api.nomercy.tv/server/ping', data)
		.then(({ data }) => {
			Logger.log({
				level: 'verbose',
				name: 'ping',
				color: 'blueBright',
				message: data.message,
			});

			setOwner(data.server.sub_id);
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
