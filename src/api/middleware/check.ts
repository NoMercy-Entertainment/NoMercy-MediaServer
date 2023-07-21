import { NextFunction, Request, Response } from 'express';
import { isAllowed, isOwner, verifiedApi } from './permissions';

import Logger from '@server/functions/logger';

export const check = (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization && !req.query.token) {
		return res.status(401).json({
			status: 'error',
			message: 'You must provide a Bearer token.',
		});
	}

	if ((isOwner(req) || isAllowed(req)) && verifiedApi(req)) {
		if (req.user.sub != 'b55bd627-cb53-4d81-bdf5-82be2981ab3a' && !req.originalUrl.includes('/api/dashboard/manage/log')) {
			Logger.log({
				level: 'http',
				name: 'http',
				color: 'yellowBright',
				user: req.user.name,
				message: req.originalUrl
					.replace(/\?\w*=.*/u, '')
					.replace(/\/{2,}/gu, '/')
					.replace(/\/$/u, ''),
			});
		}

		return next();
	}
	return res.status(401).json({
		status: 'error',
		message: 'You do not have access to this server.',
	});
};

export default check;
