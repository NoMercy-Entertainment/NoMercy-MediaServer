import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { KAuthRequest } from 'types/keycloak';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { selectAlbum } from '@/db/media/actions/albums';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as unknown as KAuthRequest).token.content.sub;
	const music = selectAlbum(req.params.id, user);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this album',
		});
	}

	const results = {
		...music,
		type: 'album',
		cover: music.cover?.replace('http://', 'https://'),
		colorPalette: JSON.parse(music.colorPalette ?? '{}'),
		artist_track: undefined,
		album_track: undefined,

		Track: uniqBy<typeof music.album_track>(music.album_track?.map((t) => {
			const artists = t.track.artist_track
				.filter(a => a.artist.id != '89ad4ac3-39f7-470e-963a-56509c546377')
				.map(a => ({
					id: a.artist.id,
					name: a.artist.name,
					cover: a.artist.cover?.replace('http://', 'https://'),
					description: a.artist.description,
					folder: a.artist.folder,
					libraryId: a.artist.library_id,
					origin: deviceId,
					colorPalette: JSON.parse(a.artist.colorPalette ?? '{}'),
				}));

			// const albums = t.Album.map(a => ({
			// 	id: a.id,
			// 	name: a?.name,
			// 	folder: a?.folder,
			// 	cover: (a?.cover ?? t.Artist[0]?.cover ?? t.cover ?? null)?.replace('http://', 'https://'),
			// 	description: a?.description,
			// 	libraryId: music.libraryId,
			// 	origin: deviceId,
			// 	colorPalette: a.colorPalette,
			// }));

			return {
				...t.track,
				date: t.track.date == null
					? undefined
					: new Date(t.track.date as string)
						.toLocaleDateString(language, {
							year: 'numeric',
							month: 'short',
							day: '2-digit',
						}),
				type: 'album',
				lyrics: typeof t.track.lyrics === 'string' && t.track.lyrics.includes('{')
					? JSON.parse(t.track.lyrics)
					: t.track.lyrics,
				favorite_track: t.track.track_user.length > 0,
				artistId: music.album_artist[0]?.artist_id,
				origin: deviceId,
				cover: t.track.cover?.replace('http://', 'https://'),
				libraryId: t.track.folder_id,
				colorPalette: JSON.parse(t.track.colorPalette ?? '{}'),
				FavoriteTrack: undefined,
				Artist: artists,
			};
		}) ?? [], 'name').sort(trackSort),
		year: music.year,
		Artist: music.description?.includes('Various Artists')
			? null
			: music.album_artist?.map((a) => {
				return {
					...a.artist,
					origin: deviceId,
					cover: a.artist.cover?.replace('http://', 'https://'),
				};
			}) ?? [],
	};

	return res.json(results);
}
