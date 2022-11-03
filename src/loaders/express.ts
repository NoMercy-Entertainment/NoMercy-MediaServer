import { AppState, useSelector } from '../state/redux';
import express, { Application, NextFunction, Request, Response } from 'express';
import { imagesPath, publicPath, setupComplete, subtitlesPath, transcodesPath } from '../state';

import Logger from '../functions/logger';
import { allowedOrigins } from '../functions/networking';
import changeLanguage from '../api/middlewares/language';
import check from '../api/middlewares/check';
import { confDb } from '../database/config';
import cors from 'cors';
import { existsSync } from 'fs';
import { initKeycloak } from '../functions/keycloak';
import path from 'path';
import routes from '../api/index';
import serveStatic from 'serve-static';
import session from 'express-session';
import { session_config } from '../functions/keycloak/config';
import { staticPermissions } from '../api/middlewares/permissions';
import { unique } from '../functions/stringArray';

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
					app.get(`/${r.Libraries[0].libraryId}/*`, staticPermissions, function(req, res) {
						if(req.params[0].split(/[\\\/]/).some(p => p.startsWith('.'))) {
							return res.status(401).json({
								status: 'error',
								message: 'Access denied',
							});
						}
						return res.sendFile(r.path + '/' + req.params[0]); 
					});
				});
		});

	app.get(`/images/*`, staticPermissions, function(req, res) {
		if(req.params[0].split(/[\\\/]/).some(p => p.startsWith('.'))) {
			return res.status(401).json({
				status: 'error',
				message: 'Access denied',
			});
		}
		if(existsSync(imagesPath + '/' + req.params[0])){
			return res.sendFile(imagesPath + '/' + req.params[0]); 
		} else {
			return res.status(404).end();
		}
	});
	app.get(`/transcodesPath/*`, staticPermissions, function(req, res) {
		if(req.params[0].split(/[\\\/]/).some(p => p.startsWith('.'))) {
			return res.status(401).json({
				status: 'error',
				message: 'Access denied',
			});
		}
		if(existsSync(transcodesPath + '/' + req.params[0])){
			return res.sendFile(transcodesPath + '/' + req.params[0]); 
		} else {
			return res.status(404).end();
		}
	});
	app.get(`/subtitles/*`, staticPermissions, function(req, res) {
		if(req.params[0].split(/[\\\/]/).some(p => p.startsWith('.'))) {
			return res.status(401).json({
				status: 'error',
				message: 'Access denied',
			});
		}
		if(existsSync(subtitlesPath + '/' + req.params[0])){
			return res.sendFile(subtitlesPath + '/' + req.params[0]); 
		} else {
			return res.status(404).end();
		}
	});

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

	app.get(`/*`, function(req, res) {
		if(req.params[0].split(/[\\\/]/).some(p => p.startsWith('.'))) {
			return res.status(401).json({
				status: 'error',
				message: 'Access denied',
			});
		}
		if(existsSync(publicPath + '/' + req.params[0])){
			return res.sendFile(publicPath + '/' + req.params[0]); 
		} else {
			return res.status(404).end();
		}
	});

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
