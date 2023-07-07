import { Request, Response } from 'express';

import { FavoritesResponse } from './favorite.d';
import { selectFavoriteTracks } from '@/db/media/actions/track_user';
import { deviceId } from '@/functions/system';

export default function (req: Request, res: Response) {

	const music = selectFavoriteTracks(req.user.sub);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No favorites',
		});
	}

	const results: FavoritesResponse = {
		cover: 'favorites',
		description: null,
		name: 'Songs you like',
		type: 'playlist',
		Track: music.map((t) => {

			const artists = t.track.artist?.map(a => ({
				id: a.id,
				name: a.name,
				cover: a.cover,
				description: a.description,
				folder: a.folder,
				libraryId: a.library_id,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));
			const albums = t.track.album?.map(a => ({
				id: a.id,
				name: a.name,
				folder: a.folder,
				cover: a.cover,
				description: a.description,
				libraryId: a.library_id,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));

			return {
				...t.track,
				type: 'favorite',
				date: t.track.date,
				lyrics: undefined,
				favorite_track: true,
				libraryId: t.track.folder_id,
				artistId: artists?.[0]?.id,
				origin: deviceId,
				cover: albums?.[0]?.cover,
				colorPalette: albums?.[0]?.colorPalette,
				artist_track: artists,
				album_track: albums,
				album: albums?.[0],
				artist: artists[0],
			};
		}),
	};

	return res.json(results);

}
