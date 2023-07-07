import { Request, Response } from 'express';

import { mediaDb } from '@/db/media';
import { track_user } from '@/db/media/schema/track_user';
import { and, eq, inArray } from 'drizzle-orm';
import { tracks } from '@/db/media/schema/tracks';
import { AppState, useSelector } from '@/state/redux';
import { Track } from '@/db/media/actions/tracks';
import { TrackUser } from '@/db/media/actions/track_user';
import { album_track } from '@/db/media/schema/album_track';
import { AlbumTrack } from '@/db/media/actions/album_track';
import { artist_track } from '@/db/media/schema/artist_track';
import { ArtistTrack } from '@/db/media/actions/artist_track';

export default async function (req: Request, res: Response) {

	const { id, value }: { id: string, value: boolean; } = req.body;

	const result = mediaDb.query.tracks.findFirst({
		where: eq(tracks.id, id),
		with: {
			track_user: true,
		},
	}) as unknown as (Track & {
		track_user: TrackUser[];
	});

	const albumTrackResult = mediaDb.query.album_track.findMany({
		where: eq(album_track.track_id, result.id),
	}) as unknown as AlbumTrack[];

	const artistTracksResult = mediaDb.query.artist_track.findMany({
		where: inArray(artist_track.track_id, albumTrackResult.map(t => t.track_id)),
	}) as unknown as ArtistTrack[];

	try {

		switch (value) {
		case true:
			mediaDb.insert(track_user)
				.values({
					track_id: id,
					user_id: req.user.sub,
				})
				.returning()
				.get();
			break;

		default:
			mediaDb.delete(track_user)
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

		const music = await mediaDb.query.tracks.findFirst({
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
