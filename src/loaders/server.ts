import { AppState, useSelector } from '@/state/redux';
import { setHttpsServer, setSocketServer } from '@/state/redux/system/actions';
// import https from '../functions/server/lib/spdy';
import { sslCA, sslCert, sslKey } from '@/state';

import Logger from '../functions/logger';
import { Server } from 'socket.io';
import _express from 'express';
import express from './express';
import fs from 'fs';
import http2Express from 'http2-express-bridge';
import https from 'https';
import ping from './ping';
import { serverRunning } from './serverRunning';
import { socket } from './socket';
import { socketCors } from '../functions/networking';

export const server = async () => {
	const app = http2Express(_express);

	await express(app);

	const secureInternalPort = useSelector((state: AppState) => state.system.secureInternalPort);

	let credentials: {
		key: string;
		cert: string;
		ca: string;
		allowHTTP1: boolean;
	};

	if (fs.existsSync(sslKey) && fs.existsSync(sslCert)) {
		credentials = {
			key: fs.readFileSync(sslKey, 'utf-8'),
			cert: fs.readFileSync(sslCert, 'utf-8'),
			ca: fs.readFileSync(sslCA, 'utf-8'),
			allowHTTP1: true,
		};

		const httpsServer = https.createServer(credentials, app);
		setHttpsServer(httpsServer);

		httpsServer
			.listen(secureInternalPort, '0.0.0.0', () => {
				serverRunning();
				ping();
			})
			.on('error', (error) => {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'magentaBright',
					message: `Sorry Something went wrong starting the secure server: ${JSON.stringify(error, null, 2)}`,
				});
				process.exit(1);
			});

		const io = new Server(httpsServer, socketCors);

		setSocketServer(io);

		socket.connect(io);
	}
};

export default server;
