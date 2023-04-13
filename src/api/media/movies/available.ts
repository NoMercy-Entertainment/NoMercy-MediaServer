import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { Prisma } from '../../../database/config/client';
import logger from '../../../functions/logger';
import { KAuthRequest } from '../../../types/keycloak';
import { isOwner } from '../../middleware/permissions';

export default function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	if (owner) {
		confDb.movie
			.findFirst(ownerQuery(req.params.id))
			.then((movie) => {
				if (!movie) {
					return res.status(404).json({
						available: false,
						server: 'local',
					});
				}
				return res.json({
					available: !!movie.VideoFile?.[0],
					server: 'local',
				});
			})
			.catch((error) => {
				logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting library: ${error}`,
				});
				return res.status(404).json({
					status: 'error',
					message: `Something went wrong getting library: ${error}`,
				});
			});
	} else {
		confDb.movie
			.findFirst(userQuery(req.params.id, user))
			.then(() => {
				return res.json({
					status: 'ok',
					available: true,
				});
			})
			.catch((error) => {
				logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting library: ${error}`,
				});
				return res.status(404).json({
					status: 'error',
					message: `Something went wrong getting library: ${error}`,
				});
			});
	}
}

const ownerQuery = (id: string) => {
	return Prisma.validator<Prisma.MovieFindFirstArgsBase>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			VideoFile: true,
		},
	});
};

const userQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.MovieFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
			Library: {
				User: {
					some: {
						userId: userId,
					},
				},
			},
		},
		include: {
			VideoFile: true,
		},
	});
};
