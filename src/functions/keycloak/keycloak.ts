import Logger from '@server/functions/logger';
import axios from 'axios';
import { setClientId, setClientSecret, setPublicKey } from '@server/state/redux/config/actions';
import { NextFunction, Response, Request } from 'express';
import { AppState, useSelector } from '@server/state/redux';
import { isAllowed, isModerator, isOwner } from '@server/api/middleware/permissions';
import { getLanguage } from '@server/api/middleware';
import i18next from 'i18next';
import passportClient from 'laravel-passport-express';
import jwtDecode from 'jwt-decode';

export let _keycloak;
export let _keycloakBackend;

export const initKeycloak = async () => {
	if (_keycloak) {
		return _keycloak;
	}

	const clientId = useSelector((state: AppState) => state.config.clientId);
	const clientSecret = useSelector((state: AppState) => state.config.clientSecret);

	_keycloak = passportClient({
		url: 'https://dev.nomercy.tv',
		clientId: clientId,
		clientSecret: clientSecret
	});

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
		const userinfo = jwtDecode(token as string) as any;

		req.user = userinfo;
		req.access_token = token as string;
		req.isOwner = isOwner(req);
		req.isModerator = isModerator(req);
		req.isAllowed = isAllowed(req);

		req.language = getLanguage(req);
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
	if (req.headers.origin === 'https://dev.nomercy.tv' || req.headers.origin === 'https://nomercy.tv') {
		return next();
	}

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

	const realm = 'https://dev.nomercy.tv/oauth';

	const info = await axios.get(realm, {
		headers: {
			'Accept-Encoding': 'gzip,deflate,compress',
			'Accept': 'application/json',
		},
	});;

	setPublicKey(info.data.public_key);
	setClientId(info.data.client_id);
	setClientSecret(info.data.client_secret);

};
