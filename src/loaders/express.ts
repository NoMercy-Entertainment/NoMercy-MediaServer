import express from 'express';
import { Application, NextFunction, Request, Response } from 'express-serve-static-core';
import { serveImagesPath, serveLibraryPaths, servePublicPath, serveTranscodePath } from '../api/routes/files';

import Logger from '../functions/logger';
import { allowedOrigins } from '../functions/networking';
import changeLanguage from '../api/middleware/language';
import check from '../api/middleware/check';
import compression from 'compression';
import cors from 'cors';
import routes from '../api/index';
import webhooks from '../api/routes/webhooks';
import { owner, setupComplete } from '@server/state';
import { staticPermissions } from '../api/middleware/permissions';

import { AppState, useSelector } from '@server/state/redux';
import { AuthMiddleware } from '@server/functions/keycloak/keycloak';


export default (app: Application) => {
	// await initAuth();

	app.use((req: Request, res: Response, next: NextFunction) => {
		res.set('X-Powered-By', 'NoMercy MediaServer');
		res.set('Access-Control-Allow-Private-Network', 'true');
		// res.header('Access-Control-Max-Age', `${60 * 60 * 24 * 7}`);

		next();
	});

	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const origins = allowedOrigins(internal_ip);

	app.use(
		cors({
			// origin: origins,
			origin: '*',
		})
	);

	const shouldCompress = (req, res) => {
		if (req.headers['x-no-compression']) {
			return false;
		}
		return compression.filter(req, res);
	};
	app.use(compression({ filter: shouldCompress }));

	app.enable('trust proxy');
	app.use(changeLanguage);
	app.use(express.json());

	app.get('/status', (req: Request, res: Response) => {
		res.status(200)
			.send({
				status: 'OK',
			});
	});
	app.head('/status', (req: Request, res: Response) => {
		res.status(200)
			.send({
				status: 'OK',
			});
	});

	app.use((req: Request, res: Response, next: NextFunction) => {
		if (origins.some(o => o == req.headers.origin)) {
			res.set('Access-Control-Allow-Origin', req.headers.origin as string);
		}

		next();
	});

	app.get('/', (req: Request, res: Response) => {
		res.redirect(`https://app${process.env.ROUTE_SUFFIX ?? ''}.nomercy.tv`);
	});

	app.use('/webhooks', webhooks);

	app.get('/images/*', serveImagesPath);
	app.get('/transcodes/*', serveTranscodePath);
	serveLibraryPaths(app);

	app.use(AuthMiddleware);
	// app.use(mustHaveToken);
	// app.use(session(session_config));
	// app.use(keycloak.initKeycloak().middleware());

	// app.get('/subtitles/*', staticPermissions, serveSubtitlesPath);

	app.use((req: Request, res: Response, next: NextFunction) => {
		res.set('owner', owner);

		next();
	});

	app.get('/api/ping', check, (req: Request, res: Response) => {
		return res.json({
			message: 'pong',
			setupComplete: setupComplete || false,
		});
	});

	app.use('/api/v1', check, changeLanguage, routes);

	app.get('/*', staticPermissions, servePublicPath);

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Express loaded',
	});

	return app;
};
