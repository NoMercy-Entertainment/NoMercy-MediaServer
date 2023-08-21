import { Request, Response } from 'express-serve-static-core';


import { track_user } from '@server/db/media/schema/track_user';
import { and, eq, inArray } from 'drizzle-orm';
import { tracks } from '@server/db/media/schema/tracks';
import { AppState, useSelector } from '@server/state/redux';
import { album_track } from '@server/db/media/schema/album_track';
import { artist_track } from '@server/db/media/schema/artist_track';

export default async function (req: Request, res: Response) {

	const { id, value }: { id: string, value: boolean; } = req.body;

	const result = globalThis.mediaDb.query.tracks.findFirst({
		where: eq(tracks.id, id),
		with: {
			track_user: true,
		},
	});

	if (!result) {
		return null;
	}

	const albumTrackResult = globalThis.mediaDb.query.album_track.findMany({
		where: eq(album_track.track_id, result.id),
	});

	const artistTracksResult = globalThis.mediaDb.query.artist_track.findMany({
		where: inArray(artist_track.track_id, albumTrackResult.map(t => t.track_id)),
	});

	try {

		switch (value) {
		case true:
			globalThis.mediaDb.insert(track_user)
				.values({
					track_id: id,
					user_id: req.user.sub,
				})
				.returning()
				.get();
			break;

		default:
			globalThis.mediaDb.delete(track_user)
				.where(
					and(
						eq(track_user.user_id, req.user.sub),
						eq(track_user.track_id, id)
					)
				)
				.returning()
				.get();

			break;
		}

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('update_content', ['music', 'collection', 'tracks', '_']);

		for (const artist of artistTracksResult ?? []) {
			socket.emit('update_content', ['music', 'artist', artist.artist_id, '_']);
		}
		for (const album of albumTrackResult ?? []) {
			socket.emit('update_content', ['music', 'album', album.album_id, '_']);
		}

		return res.json({
			...result,
			favorite_track: value,
		});


	} catch (error) {

		const music = await globalThis.mediaDb.query.tracks.findFirst({
			where: eq(tracks.id, id),
			with: {
				track_user: true,
			},
		});

		if (!music) { return {}; }

		return res.json({
			...music,
			favorite_track: music.track_user.length > 0,
		});
	}

}
