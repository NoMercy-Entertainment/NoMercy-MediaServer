import { AppState, useSelector } from '@server/state/redux';
import { tokenFile } from '@server/state';
import { readFileSync, writeFileSync } from 'fs';
import {
	setAccessToken,
	setExpiresIn,
	setIdToken,
	setNotBeforePolicy,
	setRefreshExpiresIn,
	setRefreshToken,
	setScope,
	setSessionState,
	setTokenType
} from '@server/state/redux/user/actions';

import Logger from '@server/functions/logger';
import qs from 'qs';

export const refreshToken = async () => {

	const tokens = JSON.parse(readFileSync(tokenFile, 'utf-8'));

	if (tokens.access_token) {
		setAccessToken(tokens.access_token);
		setRefreshToken(tokens.refresh_token);
		setExpiresIn(tokens.expires_in);
		setRefreshExpiresIn(tokens.refresh_expires_in);
		setTokenType(tokens.token_type);
		setIdToken(tokens.id_token);
		setNotBeforePolicy(tokens['not-before-policy']);
		setSessionState(tokens.session_state);
		setScope(tokens.scope);
	}

	await refresh();
	refreshLoop();
};

export default refreshToken;

const refreshLoop = () => {
	const expires_in = useSelector((state: AppState) => state.user.expires_in);
	setInterval(async () => {
		await refresh();
	}, (expires_in - 120) * 1000);
};

const refresh = async () => {
	Logger.log({
		level: 'info',
		name: 'auth',
		color: 'blueBright',
		message: 'Refreshing offline token',
	});

	const {
		refresh_token,
	} = JSON.parse(readFileSync(tokenFile, 'utf-8'));
	// const refresh_token = useSelector((state: AppState) => state.user.refresh_token);
	const clientId = useSelector((state: AppState) => state.config.clientId);
	const clientSecret = useSelector((state: AppState) => state.config.clientSecret);

	if (!refresh_token) {
		Logger.log({
			level: 'info',
			name: 'auth',
			color: 'red',
			message: 'No refresh token found',
		});

		// Logger.log({
		// 	level: 'info',
		// 	name: 'setup',
		// 	color: 'blueBright',
		// 	message: 'Opening browser, please login',
		// });
		
		// const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
		// const internal_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != '' && !isNaN(parseInt(process.env.DEFAULT_PORT as string, 10))
		// 	? parseInt(process.env.DEFAULT_PORT as string, 10)
		// 	: 7635;
		// const redirect_uri = `https://${internal_ip}:${internal_port}/sso-callback`;

		// const detected = DetectBrowsers();
		// if (detected) {
		// 	await open(
		// 		`https://auth.nomercy.tv/realms/NoMercyTV/protocol/openid-connect/auth?redirect_uri=${encodeURIComponent(
		// 			redirect_uri
		// 		)}&client_id=nomercy-server&response_type=code&module=refresh`,
		// 		{
		// 			wait: true,
		// 		}
		// 	);

		// } else {
		// 	// await loginPrompt().then(() => {
		// 	// 	registerComplete = true;
		// 	// });
		// }

		return;
	}

	const keycloakData = qs.stringify({
		client_id: 'd5a5a005-9ea6-4e83-bff7-9e442699889c',
		grant_type: 'refresh_token',
		client_secret: 'LAByECfzJlJrFDl6P4iEgvP28YVRps9hxaLATGL1',
		scope: 'openid profile email',
		refresh_token: refresh_token,
	});

	await fetch(useSelector((state: AppState) => state.user.keycloakUrl), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		// redirect: 'follow',
		body: keycloakData,
	})
		.then(data => data.json())
		.then((data) => {
			Logger.log({
				level: 'info',
				name: 'auth',
				color: 'blueBright',
				message: 'Offline token refreshed',
			});

			setAccessToken(data.access_token);
			setRefreshToken(data.refresh_token);
			setExpiresIn(data.expires_in);
			setRefreshExpiresIn(data.refresh_expires_in);
			setTokenType(data.token_type);
			setIdToken(data.id_token);
			setNotBeforePolicy(data['not-before-policy']);
			setSessionState(data.session_state);
			setScope(data.scope);

			writeFileSync(tokenFile, JSON.stringify(data));
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'auth',
				color: 'red',
				message: error,
			});
		});
};
