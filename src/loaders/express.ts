import { AppState, useSelector } from '../state/redux';
import express, { Application, NextFunction, Request, Response } from 'express';
import { serveImagesPath, serveLibraryPaths, servePublicPath, serveSubtitlesPath, serveTranscodePath } from '../api/routes/files';

import Logger from '../functions/logger';
import { allowedOrigins } from '../functions/networking';
import changeLanguage from '../api/middleware/language';
import check from '../api/middleware/check';
import cors from 'cors';
import { initKeycloak } from '../functions/keycloak';
import routes from '../api/index';
import session from 'express-session';
import { session_config } from '../functions/keycloak/config';
import { setupComplete } from '../state';
import { staticPermissions } from '../api/middleware/permissions';

export default async (app: Application) => {
	const owner = useSelector((state: AppState) => state.system.owner);

	const KC = initKeycloak();

	app.use(
		cors({
			origin: allowedOrigins,
		})
	);

	app.use((req: Request, res: Response, next: NextFunction) => {
		res.set('X-Powered-By', 'NoMercy MediaServer');
		res.set('Access-Control-Allow-Private-Network', 'true');
		res.set('Access-Control-Max-Age', `${60 * 60 * 24 * 7}`);

		if (allowedOrigins.some((o) => o == req.headers.origin)) {
			res.set('Access-Control-Allow-Origin', req.headers.origin as string);
		}

		next();
	});

	await serveLibraryPaths(app);

	app.get("/images/*", staticPermissions, serveImagesPath);
	app.get("/transcodesPath/*", staticPermissions, serveTranscodePath);
	app.get("/subtitles/*", staticPermissions, serveSubtitlesPath);

	app.enable('trust proxy');
	app.use(changeLanguage);
	app.use(express.json());

	app.get('/status', (req: Request, res: Response) => {
		res.status(200).end();
	});
	app.head('/status', (req: Request, res: Response) => {
		res.status(200).end();
	});

	app.use(session(session_config));
	app.use(KC.middleware());

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

	app.use('/api', KC.checkSso(), check, changeLanguage, routes);

	app.get("/*", staticPermissions, servePublicPath);

	app.get('/', (req: Request, res: Response) => {
		res.redirect('https://app.nomercy.tv');
	});

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Express loaded',
	});

	return app;
};
