import axios from 'axios';
import qs from 'qs';
import express, { Request, Response } from 'express';
import {
  KAuthRequest,
  KeycloakToken,
} from 'types/keycloak';
import { writeFileSync } from 'fs';

import dashboard from './routes/dashboard';
import Logger from '../functions/logger';
import media from './routes/media';
import music from './routes/music';
import userData from './routes/userData';
import writeToConfigFile from '../functions/writeToConfigFile';
import {
  AppState,
  store,
  useSelector,
} from '../state/redux';
import {
  setAccessToken,
  setRefreshToken,
} from '../state/redux/user/actions';
import { keycloak_key } from '../functions/keycloak/config';
import { setOwner } from '../state/redux/system/actions';
import { tokenFile } from '../state';
import { tokenParser } from '../functions/tokenParser';

// import expressMon from 'express-status-monitor';
const router = express.Router();

router.use('/dashboard', dashboard);
router.use('/userdata', userData);
router.use('/music', music);

const monitorConfig = {
	title: 'NoMercy MediaServer Status Monitor',
	theme: 'default.css',
	path: '/monitor',
	// socketPath: '/socket.io',
	// websocket: myClientList[0].io.socket,
	spans: [
		{
			interval: 1,
			retention: 60
		}, 
		{
			interval: 1,
			retention: 60 * 5
		}, 
		{
			interval: 1,
			retention: 60 * 10
		},
		{
			interval: 1,
			retention: 60 * 60
		},
	],
	chartVisibility: {
		cpu: true,
		mem: true,
		load: true,
		eventLoop: true,
		heap: true,
		responseTime: true,
		rps: true,
		statusCodes: true
	},
	healthChecks: [
		{
			protocol: 'https',
			host: '192-168-2-201.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv',
			path: '/status',
			port: store.getState().system.secureInternalPort
		}, {
			protocol: 'https',
			host: '192-168-2-201.1968dcdc-bde6-4a0f-a7b8-5af17afd8fb6.nomercy.tv',
			path: '/images/status.txt',
			port: store.getState().system.secureInternalPort
		}
	],
}

// router.use(expressMon(monitorConfig));

router.get('/me', (req: Request, res: Response) => {
	const token = (req as KAuthRequest).kauth.grant.access_token;
	return res.json(token.content);
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

router.use('/', media);

export default router;

