import { AppState, useSelector } from '@server/state/redux';
import { NextFunction, Request, Response } from 'express-serve-static-core';

import Logger from '@server/functions/logger';
import nodeCrypto from 'crypto';
import { readFileSync } from 'fs';
import { sleep } from '@server/functions/dateTime';
import { owner, sslCert } from '@server/state';
import { eq } from 'drizzle-orm';
import { users } from '@server/db/media/schema/users';

let delay = 0;
let timeout: NodeJS.Timeout;

export const hasOwner = () => {
	if (!owner) {
		return false;
	}
	return true;
};

export const verifiedApi = (req: Request): boolean => {
	if (req.user.sub == 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		const secret = req?.body?.secret;

		if (!secret) return false;
		try {
			const dec = nodeCrypto.publicDecrypt(readFileSync(sslCert, 'utf-8'), Buffer.from(secret, 'base64')).toString('utf8');
			return dec == 'NoMercy MediaServer';
		} catch (error) {
			delay += 60;
			clearTimeout(timeout);

			Logger.log({
				level: 'http',
				name: 'http',
				color: 'redBright',
				message: 'Someone tried to access the server with the api authentication that is not the official api server.',
			});

			sleep(delay);

			timeout = setTimeout(() => {
				delay = 0;
			}, 10 * 60 * 1000);

			return false;
		}
	} else {
		return true;
	}
};

export const isOwner = (req: Request | string): boolean => {
	if (typeof req == 'string') {
		return owner == req;
	}
	if (!req.user) {
		return false;
	}
	return owner == req.user.sub;
};

export const ownerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isOwner(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isTestAccount = (req: Request): boolean => {
	return req.user.email == 'test@nomercy.tv';
};

export const testAccountMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isTestAccount(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isModerator = (req: Request): boolean => {
	const moderators = useSelector((state: AppState) => state.config.moderators);

	return moderators.some(m => m.id == req.user.sub);
};

export const moderatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isModerator(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const hasEditPermissions = (req: Request): boolean => {
	if (req.user.sub == 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		return true;
	}

	return isOwner(req) || isModerator(req) || (globalThis.allowedUsers.find(m => m.id == req.user.sub)?.manage ?? false);
};

export const editMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (hasEditPermissions(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isAllowed = (req: Request): boolean => {
	if (!req.user) {
		return false;
	}
	if (req.user.sub == 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		return true;
	}
	if (isOwner(req) || isModerator(req)) {
		return true;
	}

	if (!globalThis.allowedUsers.some(u => u.id == req.user.sub) && req.user.sub != 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		Logger.log({
			level: 'http',
			name: 'http',
			color: 'redBright',
			message: `Unauthorized access attempt from ${req.user.email}`,
		});
	}

	return globalThis.allowedUsers.some(u => u.id == req.user.sub);
};

// export const allowedMiddleware = (req: Request, res: Response, next: NextFunction) => {
// 	if (isAllowed(req)) {
// 		return next();
// 	}
// 	return res.status(403).json({
// 		status: 'error',
// 		message: 'You do not have access to this resource.',
// 	});
// };

export const staticPermissions = (req: Request, res: Response, next: NextFunction) => {
	if (req.headers.origin === 'https://dev.nomercy.tv' || req.headers.origin === 'https://nomercy.tv') {
		return next();
	}
	if (isOwner(req) || isAllowed(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const permissions = (req: Request, res: Response) => {

	if (!req.user) {
		return false;
	}
	if (isOwner(req) || isModerator(req)) {
		return res.json({
			edit: true,
		});
	}

	try {

		const data = globalThis.mediaDb.query.users.findFirst({
			where: eq(users.id, req.user.sub),
		});

		return res.json({
			edit: data?.manage ?? false,
		});
	} catch (error) {

		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error getting user permissions: ${error}`,
		});
		return res.json({
			status: 'error',
			message: `Something went wrong getting user permissions: ${error}`,
		});
	}

};
