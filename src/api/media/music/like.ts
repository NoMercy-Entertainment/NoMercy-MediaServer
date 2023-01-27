import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';

export default async function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const { id, value }: { id: string, value: boolean } = req.body;

	let query;

	switch (value) {
	case true:
		query = {
			connectOrCreate: {
				where: {
					favorite_track_unique: {
						trackId: id,
						userId: user,
					},
				},
				create: {
					userId: user,
				},
			},
		};
		break;

	default:
		query = {
			delete: {
				favorite_track_unique: {
					trackId: id,
					userId: user,
				},
			},
		};
		break;
	}

	try {
		const music = await confDb.track.update({
			where: {
				id: id,
			},
			data: {
				FavoriteTrack: query,
			},
			include: {
				FavoriteTrack: {
					where: {
						userId: user,
					},
				},
			},
		});

		return res.json({
			...music,
			favorite_track: music.FavoriteTrack.length > 0,
		});

	} catch (error) {

		const music = await confDb.track.findFirst({
			where: {
				id: id,
			},
			include: {
				FavoriteTrack: true,
			},
		});

		if (!music) { return {}; }

		return res.json({
			...music,
			favorite_track: music.FavoriteTrack.length > 0,
		});
	}

}
