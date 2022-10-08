import Logger from '../../functions/logger';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import { setKeycloakCertificate } from '../../state/redux/config/actions';
import axios from 'axios';

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

	const info = await axios.get(realm);

	const key = `-----BEGIN PUBLIC KEY-----\n${info.data.public_key}\n-----END PUBLIC KEY-----`;

	setKeycloakCertificate(key);

	return key;
}

// export default {
// 	initKeycloak,
// 	getKeycloak,
// 	_keycloak,
// };
