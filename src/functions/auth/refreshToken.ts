import { tokenFile } from '@server/state';
import { writeFileSync } from 'fs';
import Logger from '@server/functions/logger';
import { tokenUrl } from './config';
import { aquireToken } from './login';
import { getRefreshToken, getTokenExpiration, tempServer } from './helpers';
import { AppState, useSelector } from '@server/state/redux';

export const refreshToken = async () => {
	console.log(getTokenExpiration() ?? 7200);
	await refresh();
	refreshLoop();
};

export default refreshToken;

const refreshLoop = () => {
	// setInterval(async () => {
	// 	await refresh();
	// }, ((getTokenExpiration() ?? 7200) - 120) * 1000);
};

const refresh = async () => {
	Logger.log({
		level: 'info',
		name: 'auth',
		color: 'blueBright',
		message: 'Refreshing offline token ',
	});

	if (!getRefreshToken()) {
		const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);
		const server = tempServer(secureInternalPort);

		await aquireToken();

		server?.close();

		return;
	}
	
	const refreshTokenData = new URLSearchParams({
		client_id: globalThis.client_id,
		grant_type: 'refresh_token',
		client_secret: globalThis.client_secret,
		scope: globalThis.authorizationScopes,
		refresh_token: getRefreshToken(),
	}).toString();

	try {

		const response = await fetch(tokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: refreshTokenData,
		});

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error_description);
		}	

		globalThis.access_token = data.access_token;
		globalThis.refresh_token = data.refresh_token;
		globalThis.expires_in = data.expires_in;
		globalThis.refresh_expires_in = data.refresh_expires_in;
		globalThis.token_type = data.token_type;
		globalThis.id_token = data.id_token;
		globalThis.nbp = data['not-before-policy'];
		globalThis.session_state = data.session_state;
		globalThis.scope = data.scope;
		
		if (data.access_token) {
			writeFileSync(tokenFile, JSON.stringify(data));
		
			Logger.log({
				level: 'info',
				name: 'auth',
				color: 'blueBright',
				message: 'Offline token refreshed ',
			});
		}
	} catch (error: any) {

		Logger.log({
			level: 'error',
			name: 'auth',
			color: 'red',
			message: error,
		});

		await aquireToken();
	}

	return;
};
