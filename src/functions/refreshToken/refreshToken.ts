import { keycloak_key } from '../keycloak/config';
import Logger from '../../functions/logger';
import axios from 'axios';
import qs from 'qs';
import { AppState, useSelector } from '../../state/redux';
import { KeycloakToken } from 'types/keycloak';
import {
	setAccessToken,
	setRefreshToken,
	setExpiresIn,
	setRefreshExpiresIn,
	setTokenType,
	setIdToken,
	setNotBeforePolicy,
	setSessionState,
	setScope,
} from '../../state/redux/user';
import { configFile, tokenFile } from '../../state';
import { readFileSync, writeFileSync } from 'fs';
import { setOwner } from '../../state/redux/system/actions';

export default async () => {

	const tokens = JSON.parse(readFileSync(tokenFile, 'utf-8'));
	const config = JSON.parse(readFileSync(configFile, 'utf8'));

	setOwner(config?.user_id ?? ('' as string));
	
	setAccessToken(tokens.access_token);
	setRefreshToken(tokens.refresh_token);
	setExpiresIn(tokens.expires_in);
	setRefreshExpiresIn(tokens.refresh_expires_in);
	setTokenType(tokens.token_type);
	setAccessToken(tokens.id_token);
	setNotBeforePolicy(tokens['not-before-policy']);
	setAccessToken(tokens.session_state);
	setAccessToken(tokens.scope);

	await refresh();
	refreshLoop();
};

const refreshLoop = () => {
	const expires_in = useSelector((state: AppState) => state.user.expires_in);
	setTimeout(async () => {
		await refresh();
		refreshLoop();
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

	await axios
		.post<KeycloakToken>(
			useSelector((state: AppState) => state.user.keycloakUrl),
			keycloakData
		)
		.then(({ data }) => {
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
				color: 'blueBright',
				message: error,
			});
		});
};
