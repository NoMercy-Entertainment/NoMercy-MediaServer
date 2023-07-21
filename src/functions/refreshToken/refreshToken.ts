import { AppState, useSelector } from '@server/state/redux';
import { configFile, tokenFile } from '@server/state';
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
import { keycloak_key } from '../keycloak/config';
import qs from 'qs';
import { setOwner } from '@server/state/redux/system/actions';

export const refreshToken = async () => {

	const tokens = JSON.parse(readFileSync(tokenFile, 'utf-8'));
	const config = JSON.parse(readFileSync(configFile, 'utf8'));

	setOwner(config?.user_id ?? ('' as string));

	setAccessToken(tokens.access_token);
	setRefreshToken(tokens.refresh_token);
	setExpiresIn(tokens.expires_in);
	setRefreshExpiresIn(tokens.refresh_expires_in);
	setTokenType(tokens.token_type);
	setIdToken(tokens.id_token);
	setNotBeforePolicy(tokens['not-before-policy']);
	setSessionState(tokens.session_state);
	setScope(tokens.scope);

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
		name: 'keycloak',
		color: 'blueBright',
		message: 'Refreshing offline token',
	});

	const keycloakData = qs.stringify({
		client_id: 'nomercy-server',
		grant_type: 'refresh_token',
		client_secret: keycloak_key,
		scope: 'openid offline_access',
		refresh_token: useSelector((state: AppState) => state.user.refresh_token),
	});

	await fetch(useSelector((state: AppState) => state.user.keycloakUrl), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow',
		body: keycloakData,
	})
		.then(data => data.json())
		.then((data) => {
			Logger.log({
				level: 'info',
				name: 'keycloak',
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
				name: 'keycloak',
				color: 'red',
				message: error,
			});
		});
};
