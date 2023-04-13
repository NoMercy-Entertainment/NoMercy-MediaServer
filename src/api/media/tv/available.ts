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
		confDb.tv
			.findFirst(ownerQuery(req.params.id))
			.then((tv) => {
				if (!tv) {
					return res.status(404).json({
						available: false,
					});
				}
				return res.json({
					available: tv.Season.map(s => s.Episode.map(e => e.VideoFile?.[0])).flat()
						.filter(Boolean).length > 0,
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
		confDb.tv
			.findFirst(userQuery(req.params.id, user))
			.then((tv) => {
				if (!tv) {
					return res.status(404).json({
						available: false,
					});
				}
				return res.json({
					available: true,
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
	}
}

const ownerQuery = (id: string) => {
	return Prisma.validator<Prisma.TvFindFirstArgsBase>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			Season: {
				include: {
					Episode: {
						include: {
							VideoFile: true,
						},
					},
				},
			},
		},
	});
};

const userQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.TvFindFirstArgs>()({
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
			Season: {
				include: {
					Episode: {
						include: {
							VideoFile: true,
						},
					},
				},
			},
		},
	});
};
