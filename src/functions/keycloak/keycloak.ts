import Logger from '@server/functions/logger';
import { NextFunction, Response, Request } from 'express';
import { isAllowed, isModerator, isOwner } from '@server/api/middleware/permissions';
import { getCountry, getLanguage } from '@server/api/middleware';
import i18next from 'i18next';
// import passportClient from 'laravel-passport-express';
import { jwtDecode } from 'jwt-decode';

export let _auth: any;
export let _authBackend: any;

// export const initAuth = () => {
// 	if (_auth) {
// 		return _auth;
// 	}

// 	_auth = passportClient({
// 		url: 'https://dev.nomercy.tv',
// 		clientId: globalThis.client_id,
// 		clientSecret: globalThis.client_secret,
// 	});

// 	Logger.log({
// 		level: 'info',
// 		name: 'setup',
// 		color: 'blueBright',
// 		message: 'Keycloak loaded',
// 	});
// 	return _auth;
// };
import Keycloak from 'keycloak-connect';
import keycloakConfig, { key, keycloak_key } from './config';
import session from 'express-session';
// import axios from 'axios';
// import { authBaseUrl } from '../auth/config';

let _keycloak;

function initKeycloak() {
	if (_keycloak) {
		return _keycloak;
	}
	const memoryStore = new session.MemoryStore();
	_keycloak = new Keycloak(
		{
			store: memoryStore,
			scope: 'openid profile offline_access email',
		},
		keycloakConfig
	);

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: 'Keycloak loaded',
	});
	return _keycloak;

}

function getKeycloak() {
	if (!_keycloak) {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'magentaBright',
			message: 'Keycloak has not been initialized. Please called init first.',
		});
	}
	return _keycloak;
}

export default {
	Keycloak,
	initKeycloak,
	getKeycloak,
	keycloakConfig,
};


export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization && !req.query.token) {

		req.language = getLanguage(req);
		req.country = getCountry(req);
		await i18next.changeLanguage(req.language);

		return next();
	}

	const token = req.query.token ?? (req.headers.authorization as string)?.split(',')[0]?.split(' ')[1];

	try {
		const userinfo = jwtDecode(token as string) as any;

		req.user = userinfo;
		req.access_token = token as string;
		req.isOwner = isOwner(req);
		req.isModerator = isModerator(req);
		req.isAllowed = isAllowed(req);

		req.language = getLanguage(req);
		req.country = getCountry(req);
		await i18next.changeLanguage(req.language);

		return next();
	} catch (error) {

		return res.status(401).json({
			status: 'error',
			// message: error,
			message: 'You must provide a valid Bearer token.',
		});

	}
};

export const mustHaveToken = (req: Request, res: Response, next: NextFunction) => {

	if (!req.headers.authorization && !req.query.token) {
		return res.status(401).json({
			status: 'error',
			message: 'You must provide a Bearer token.',
		});
	}

	return next();
};

// export const getKeycloak = () => {
// 	if (!_auth) {
// 		Logger.log({
// 			level: 'error',
// 			name: 'App',
// 			color: 'magentaBright',
// 			message: 'Keycloak has not been initialized. Please called init first.',
// 		});
// 	}
// 	return _auth;
// };

export const getAuthKeys = () => {

	// const info = await axios.get(authBaseUrl, {
	// 	headers: {
	// 		'Accept-Encoding': 'gzip,deflate,compress',
	// 		'Accept': 'application/json',
	// 	},
	// }); ;

	// globalThis.public_key = info.data.public_key;
	// globalThis.client_id = info.data.server.token_client.client_id;
	// globalThis.client_secret = info.data.server.token_client.client_secret;

	globalThis.public_key = key;
	globalThis.client_id = 'nomercy-server';
	globalThis.client_secret = keycloak_key;

};
