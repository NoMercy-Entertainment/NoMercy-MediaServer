import { AppState, useSelector } from '@server/state/redux';
import { KeycloakToken } from '@server/types/keycloak';
import express, { Request, Response } from 'express';
import { setAccessToken, setRefreshToken } from '@server/state/redux/user/actions';

import Logger from '../functions/logger';
import axios from 'axios';
import { keycloak_key } from '../functions/keycloak/config';
import qs from 'qs';
import { setOwner } from '@server/state/redux/system/actions';
import { tokenFile } from '@server/state';
import { tokenParser } from '../functions/tokenParser';
import { writeFileSync } from 'fs';
import writeToConfigFile from '../functions/writeToConfigFile';
// import expressMon from 'express-status-monitor';

import dashboard from './routes/dashboard';
import media from './routes/media';
import music from './routes/music';
import userData from './routes/userData';
// import { deviceId } from '@server/functions/system';

const router = express.Router();

// const monitorConfig = {
// 	title: 'NoMercy MediaServer Status Monitor',
// 	theme: 'default.css',
// 	path: '/monitor',
// 	socketPath: '/socket.io',
// 	spans: [
// 		{
// 			interval: 1,
// 			retention: 60,
// 		},
// 		{
// 			interval: 1,
// 			retention: 60 * 5,
// 		},
// 		{
// 			interval: 1,
// 			retention: 60 * 10,
// 		},
// 		{
// 			interval: 1,
// 			retention: 60 * 60,
// 		},
// 	],
// 	chartVisibility: {
// 		cpu: true,
// 		mem: true,
// 		load: true,
// 		eventLoop: true,
// 		responseTime: true,
// 		statusCodes: true,
// 	},
// 	healthChecks: [
// 		{
// 			protocol: 'https',
// 			host: `${store.getState().system.internal_ip.replace(/\./gu, '-')}.${deviceId}.nomercy.tv`,
// 			path: '/status',
// 			port: store.getState().system.secureInternalPort,
// 		},
// 	],
// };

router.get('/me', (req: Request, res: Response) => {
	return res.json(req.user);
});

router.get('/sso-callback', async (req: Request, res: Response) => {
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	const redirect_uri = `http://${internal_ip}:${secureInternalPort}/sso-callback`;

	const keycloakData = qs.stringify({
		client_id: 'nomercy-server',
		grant_type: 'authorization_code',
		client_secret: keycloak_key,
		scope: 'openid offline_access',
		code: req.query.code,
		redirect_uri: redirect_uri,
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
				message: 'Server authenticated',
			});

			setAccessToken(data.access_token);
			setRefreshToken(data.refresh_token);

			const userId = tokenParser(data.access_token).sub;
			setOwner(userId);
			writeToConfigFile('user_id', userId);

			writeFileSync(tokenFile, JSON.stringify(data));

			res.send('<script>window.close();</script>').end();
		})
		.catch(({ response }) => {
			Logger.log({
				level: 'error',
				name: 'keycloak',
				color: 'red',
				message: JSON.stringify(response.data, null, 2),
			});
			return res.json(response.data);
		});
});

router.use('/dashboard', dashboard);
router.use('/userdata', userData);
router.use('/music', music);
router.use('/', media);

// router.use(expressMon(monitorConfig));

export default router;

