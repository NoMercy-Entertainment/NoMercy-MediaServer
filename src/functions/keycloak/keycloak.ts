import Keycloak from 'keycloak-connect';
import Logger from '../../functions/logger';
import axios from 'axios';
import session from 'express-session';
import { setKeycloakCertificate } from '@/state/redux/config/actions';

export let _keycloak;

export const initKeycloak = () => {
	if (_keycloak) {
		return _keycloak;
	}
	const memoryStore = new session.MemoryStore();
	_keycloak = new Keycloak(
		{
			store: memoryStore,
			scope: 'openid profile offline_access email',
		},
		{
			realm: 'NoMercyTV',
			'bearer-only': true,
			'auth-server-url': 'https://auth.nomercy.tv/auth/',
			'ssl-required': 'all',
			resource: 'nomercy-server',
			'confidential-port': 0,
		}
	);

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Keycloak loaded',
	});
	return _keycloak;
};

export const getKeycloak = () => {
	if (!_keycloak) {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'magentaBright',
			message: 'Keycloak has not been initialized. Please called init first.',
		});
	}
	return _keycloak;
};

export const getKeycloakKeys = async () => {

	const realm = 'https://auth.nomercy.tv/auth/realms/NoMercyTV';

	const info = await axios.get(realm, {
		headers: {
			'Accept-Encoding': 'gzip,deflate,compress',
			'Accept': 'application/json',
		},
	});

	const key = `-----BEGIN PUBLIC KEY-----\n${info.data.public_key}\n-----END PUBLIC KEY-----`;

	setKeycloakCertificate(key);

	return key;
};
