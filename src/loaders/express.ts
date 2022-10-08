import cors from 'cors';
import { confDb } from '../database/config';
import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import Logger from '../functions/logger';
import { unique } from '../functions/stringArray';
import session from 'express-session';

import routes from '../api/index';
import check from '../api/middlewares/check';
import changeLanguage from '../api/middlewares/language';
import { staticPermissions } from '../api/middlewares/permissions';
import { allowedOrigins } from '../functions/networking';
import { imagesPath, subtitlesPath, transcodesPath } from '../state';
import { AppState, useSelector } from '../state/redux';
import { initKeycloak } from '../functions/keycloak';
import { session_config } from '../functions/keycloak/config';

export default async (app: Application) => {
	const owner = useSelector((state: AppState) => state.system.owner);

	const KC = initKeycloak();

	const staticOptions = {
		dotfiles: 'deny',
	};

	app.use((req: Request, res: Response, next: NextFunction) => {
		res.set('X-Powered-By', 'NoMercy MediaServer');
		res.set('Access-Control-Max-Age', `${60 * 60 * 24 * 7}`);

		if (allowedOrigins.some((o) => o == req.headers.origin)) {
			res.set('Access-Control-Allow-Origin', req.headers.origin as string);
		}

		next();
	});

	app.use(
		cors({
			origin: allowedOrigins,
		})
	);

	await confDb.folder
		.findMany({
			include: {
				Libraries: true,
			},
		})
		.then((folders) => {
			unique(folders, 'path')
				.filter((r) => r.path)
				.map((r) => {
					app.use(
						`/${r.Libraries[0].libraryId}`,
						// staticPermissions,
						express.static(r.path, staticOptions)
					);
				});
		});

	app.use('/images', staticPermissions, express.static(imagesPath, staticOptions));
	app.use('/transcodesPath', staticPermissions, express.static(transcodesPath, staticOptions));
	app.use('/subtitles', staticPermissions, express.static(subtitlesPath, staticOptions));

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
		const config = JSON.parse(process.env.CONFIG as string);

		return res.json({
			message: 'pong',
			setupComplete: config.setupComplete || false,
		});
	});

	app.use('/api', KC.checkSso(), check, changeLanguage, routes);

	app.use('/', staticPermissions, express.static(path.join(__dirname, '..', 'public'), staticOptions));
	app.get('/', (req: Request, res: Response) => {
		res.redirect('https://app.nomercy.tv');
	});

	// app.use(
	// 	'/Ripper',
	// 	staticPermissions,
	// 	express.static(config.ripperOutFolder, staticOptions)
	// );

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Express loaded',
	});

	return app;
};
