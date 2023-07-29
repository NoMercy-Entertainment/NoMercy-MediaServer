import { Keycloak as KCBackend } from 'keycloak-backend';
import Logger from '@server/functions/logger';
import axios from 'axios';
import { setKeycloakCertificate } from '@server/state/redux/config/actions';
import { keycloak_key } from './config';
import { Issuer } from 'openid-client';
import { NextFunction, Response, Request } from 'express';
import { AppState, useSelector } from '@server/state/redux';
import { isAllowed, isModerator, isOwner } from '@server/api/middleware/permissions';
import { getLanguage } from '@server/api/middleware';
import i18next from 'i18next';

export let _keycloak;
export let _keycloakBackend;

export const initKeycloak = async () => {
	if (_keycloak) {
		return _keycloak;
	}
	const internalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const keycloakIssuer = await Issuer.discover('https://auth.nomercy.tv/realms/NoMercyTV');
	
	_keycloak = new keycloakIssuer.Client({
		client_id: 'nomercy-server',
		client_secret: keycloak_key,
		redirect_uris: [`http://localhost:${internalPort}/cb`],
		response_types: ['token'],
	});

	_keycloakBackend = new KCBackend(
		{
			realm: 'NoMercyTV',
			keycloak_base_url: 'https://auth.nomercy.tv/',
			client_id: 'nomercy-server',
			client_secret: keycloak_key,
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

export const kcMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization && !req.query.token) {
		return next();
	}

	const token = req.query.token ?? (req.headers.authorization as string)?.split(',')[0]?.split(' ')[1];
	
	try {
		
		const userinfo = await _keycloak.userinfo(token);
		
		req.user = userinfo;
		req.access_token = token as string;
		req.isOwner = isOwner(req);
		req.isModerator = isModerator(req);
		req.isAllowed = isAllowed(req);

		req.language = getLanguage(req);
		i18next.changeLanguage(req.language);

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

	const realm = 'https://auth.nomercy.tv/realms/NoMercyTV';

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
