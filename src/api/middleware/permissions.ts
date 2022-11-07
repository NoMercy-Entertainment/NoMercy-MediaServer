import { AppState, useSelector } from '../../state/redux';
import { NextFunction, Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import Logger from '../../functions/logger';
import { confDb } from '../../database/config';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { sleep } from '../../functions/dateTime';
import { sslCert } from '../../state';

let delay = 0;
let timeout: NodeJS.Timeout;

export const hasOwner = () => {
	const owner = useSelector((state: AppState) => state.system.owner);
	if (!owner) {
		return false;
	}
	return true;
};

export const verifiedApi = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant?.access_token;

	if (token.content.sub == 'b55bd627-cb53-4d81-bdf5-82be2981ab3a') {
		const secret = req?.body?.secret;

		if (!secret) return false;
		try {
			const dec = crypto.publicDecrypt(readFileSync(sslCert, 'utf-8'), Buffer.from(secret, 'base64')).toString('utf8');

			return dec == 'NoMercy MediaServer';
		} catch (error) {
			delay += 60;
			clearTimeout(timeout);

			Logger.log({
				level: 'http',
				name: 'http',
				color: 'redBright',
				message: 'Someone tried to access the server with the api authenitcation that is not the offical api server.',
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

export const isOwner = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant.access_token;
	const owner = useSelector((state: AppState) => state.system.owner);
	return owner == token.content.sub;
};
export const ownerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isOwner(req as KAuthRequest)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isTestAccount = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant.access_token;
	return token.content.email == 'test@nomercy.tv';
};
export const testAccountMiddleware = (req: KAuthRequest, res: Response, next: NextFunction) => {
	if (isTestAccount(req as KAuthRequest)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isModerator = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant.access_token;
	const moderators = useSelector((state: AppState) => state.config.moderators);
	
	return moderators.some((m) => m.id == token.content.sub);
};
export const moderatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isModerator(req as KAuthRequest)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const hasEditPermissions = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant.access_token;
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	return isOwner(req) || isModerator(req) || (allowedUsers.find((m) => m.sub_id == token.content.sub)?.manage ?? false);
};
export const editMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (hasEditPermissions(req as KAuthRequest)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const isAllowed = (req: KAuthRequest): boolean => {
	const token = req.kauth.grant.access_token;
	const openServer = useSelector((state: AppState) => state.config.openServer);
	const allowedUsers = useSelector((state: AppState) => state.config.allowedUsers);

	// const allowedUsers = await confDb.user.findMany({
	// 	where:{ 
	// 		allowed: true,
	// 	}
	// });
	
	if(!allowedUsers.some((u) => u.email == token.content.email)){
		Logger.log({
			level: 'http',
			name: 'http',
			color: 'redBright',
			message: `Unauthorized access attempt from ${token.content.email}`,
		});
	}

	return isOwner(req) || isModerator(req) || allowedUsers.some((u) => u.email == token.content.email) || openServer;
};
export const allowedMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (isAllowed(req as KAuthRequest)) {
		return next();
	}
	return res.status(403).json({
		status: 'error',
		message: 'You do not have access to this resource.',
	});
};

export const staticPermissions = (req: Request, res: Response, next: NextFunction) => {
	return next();
};

export const permissions = async (req: Request, res: Response) => {

	if(isOwner(req as KAuthRequest) || isModerator(req as KAuthRequest)){
		return res.json({
			edit: true,
		});
	}

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	confDb.user.findFirst({
		where: {
			sub_id: user,
		}
	}).then((data => {
		return res.json({
			edit: data?.manage ?? false,
		});
	}))
	.catch((error) => {
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
	});
};
