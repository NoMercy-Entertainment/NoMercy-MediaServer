import { Request, Response, Application } from 'express';
import { imagesPath, publicPath, subtitlesPath, transcodesPath } from '@/state';

import { existsSync } from 'fs';
import { staticPermissions } from '../middleware/permissions';
import { mustHaveToken } from '@/functions/keycloak';
import { findFoldersDB } from '@/db/media/actions/folders';

export const serveImagesPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied',
		});
	}
	try {
		if (existsSync(`${imagesPath}/${req.params[0]}`)) {
			return res.sendFile(`${imagesPath}/${req.params[0]}`);
		}
		return res.status(404).end();

	} catch (error) {
		return res.status(404).end();
	};
};

export const serveTranscodePath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied',
		});
	}
	try {
		if (existsSync(`${transcodesPath}/${req.params[0]}`)) {
			return res.sendFile(`${transcodesPath}/${req.params[0]}`);
		}
		return res.status(404).end();

	} catch (error) {
		return res.status(404).end();
	}
};

export const serveSubtitlesPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied',
		});
	}
	try {
		if (existsSync(`${subtitlesPath}/${req.params[0]}`)) {
			return res.sendFile(`${subtitlesPath}/${req.params[0]}`);
		}
		return res.status(404).end();

	} catch (error) {
		return res.status(404).end();
	}
};

export const servePublicPath = (req: Request, res: Response) => {
	if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
		return res.status(401).json({
			status: 'error',
			message: 'Access denied',
		});
	}
	try {
		if (existsSync(`${publicPath}/${req.params[0]}`)) {
			return res.sendFile(`${publicPath}/${req.params[0]}`);
		}
		return res.status(404).end();

	} catch (error) {
		return res.status(404).end();
	}
};

export const serveLibraryPaths = (app: Application) => {
	findFoldersDB().map((r) => {
		app.get(`/${r.id}/*`, mustHaveToken, staticPermissions, (req: Request, res: Response) => {
			if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
				return res.status(401).json({
					status: 'error',
					message: 'Access denied',
				});
			}
			return res.sendFile(`${r.path}/${req.params[0]}`);
		});
	});
};
