import { Request, Response } from 'express';
import { imagesPath, publicPath, subtitlesPath, transcodesPath } from '@/state';

import { confDb } from '../../database/config';
import { existsSync } from 'fs';
import { staticPermissions } from '../middleware/permissions';
import { unique } from '../../functions/stringArray';

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

export const serveLibraryPaths = async (app) => {
	await confDb.folder
		.findMany({
			include: {
				Libraries: true,
			},
		})
		.then((folders) => {
			unique(folders, 'path')
				.filter(r => r.path)
				.map((r) => {
					app.get(`/${r.Libraries[0]?.libraryId}/*`, staticPermissions, (req: Request, res: Response) => {
						if (req.params[0].split(/[\\\/]/u).some(p => p.startsWith('.'))) {
							return res.status(401).json({
								status: 'error',
								message: 'Access denied',
							});
						}
						return res.sendFile(`${r.path}/${req.params[0]}`);
					});
				});
		});
};
