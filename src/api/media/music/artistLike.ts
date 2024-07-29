import { Request, Response } from 'express-serve-static-core';


import { artist_user } from '@server/db/media/schema/artist_user';
import { and, eq } from 'drizzle-orm';
import { artists } from '@server/db/media/schema/artists';
import { AppState, useSelector } from '@server/state/redux';

export default async function (req: Request, res: Response) {

	const { id, value }: { id: string, value: boolean; } = req.body;

	const result = globalThis.mediaDb.query.artists.findFirst({
		where: eq(artists.id, id),
		with: {
			artist_user: true,
		},
	});

	if (!result) {
		return null;
	}

	try {

		switch (value) {
		case true:
			globalThis.mediaDb.insert(artist_user)
				.values({
					artist_id: id,
					user_id: req.user.sub,
				})
				.returning()
				.get();
			break;

		default:
			globalThis.mediaDb.delete(artist_user)
				.where(
					and(
						eq(artist_user.user_id, req.user.sub),
						eq(artist_user.artist_id, id)
					)
				)
				.returning()
				.get();

			break;
		}

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('update_content', ['music', 'artist', id, '_']);
		socket.emit('update_content', ['music', '_']);

		return res.json({
			...result,
			favorite_artist: value,
		});


	} catch (error) {

		const music = await globalThis.mediaDb.query.artists.findFirst({
			where: eq(artists.id, id),
			with: {
				artist_user: true,
			},
		});

		if (!music) { return {}; }

		return res.json({
			...music,
			favorite_artist: music.artist_user.length > 0,
		});
	}

}
