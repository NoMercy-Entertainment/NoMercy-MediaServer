import { AppState, useSelector } from '@server/state/redux';
import { NextFunction, Request, Response } from 'express';

import Logger from '@server/functions/logger';
import nodeCrypto from 'crypto';
import { readFileSync } from 'fs';
import { sleep } from '@server/functions/dateTime';
import { sslCert } from '@server/state';
import { eq } from 'drizzle-orm';
import { users } from '@server/db/media/schema/users';

let delay = 0;
let timeout: NodeJS.Timeout;

export const hasOwner = () => {
	const owner = useSelector((state: AppState) => state.system.owner);
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

export const isOwner = (req: Request): boolean => {
	const owner = useSelector((state: AppState) => state.system.owner);
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
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	return isOwner(req) || isModerator(req) || (allowedUsers.find(m => m.sub_id == req.user.sub)?.manage ?? false);
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
	const openServer = useSelector((state: AppState) => state.config.openServer);
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	if (!allowedUsers.some(u => u.email == req.user.email) && req.user.sub != 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		Logger.log({
			level: 'http',
			name: 'http',
			color: 'redBright',
			message: `Unauthorized access attempt from ${req.user.email}`,
		});
	}

	return isOwner(req) || isModerator(req) || allowedUsers.some(u => u.email == req.user.email) || openServer;
};

export const allowedMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isAllowed(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const staticPermissions = (req: Request, res: Response, next: NextFunction) => {
	if (isOwner(req) || isAllowed(req)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const permissions = (req: Request, res: Response) => {

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
