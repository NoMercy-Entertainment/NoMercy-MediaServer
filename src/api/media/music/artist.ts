import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { KAuthRequest } from 'types/keycloak';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { selectArtist } from '@/db/media/actions/artists';

export default function (req: Request, res: Response) {
	const language = getLanguage(req);

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const music = selectArtist(req.params.id, user);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this artist',
		});
	}

	const results = {
		...music,
		type: 'artist',
		cover: music.cover,

		colorPalette: JSON.parse(music.colorPalette ?? '{}'),

		blurHash: music.blurHash ?? null,
		artist_track: undefined,
		album_artist: undefined,

		Track: uniqBy<typeof music.artist_track>(music.artist_track?.map((t) => {
			const albums = t.track.album_track.map(a => ({
				id: a.album.id,
				name: a.album.name,
				folder: a.album.folder,
				cover: a.album.cover?.replace('http://', 'https://'),
				description: a.album.description,
				libraryId: music.library_id,
				origin: deviceId,
				colorPalette: JSON.parse(a.album.colorPalette ?? '{}'),
			}));
			const artists = t.track.artist_track
				.filter(a => a.artist.id != '89ad4ac3-39f7-470e-963a-56509c546377').map(a => ({
					id: a.artist.id,
					name: a.artist.name,
					cover: a.artist.cover?.replace('http://', 'https://'),
					description: a.artist.description,
					folder: a.artist.folder,
					libraryId: a.artist.library_id,
					origin: deviceId,
					colorPalette: JSON.parse(a.artist.colorPalette ?? '{}'),
				}));

			return {
				...t.track,
				date:
					t.track.date
					&& language
					&& new Date(t.track.date).toLocaleDateString(language, {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					}),
				type: 'artist',
				lyrics: typeof t.track.lyrics === 'string' && t.track.lyrics.includes('{')
					? JSON.parse(t.track.lyrics)
					: t.track.lyrics,
				favorite_track: t.track.track_user.length > 0,
				origin: deviceId,
				Artist: artists,
				cover: (t.track.cover ?? null)?.replace('http://', 'https://'),
				FavoriteTrack: undefined,
				libraryId: t.track.folder_id,
				blurHash: t.track.blurHash,
				colorPalette: JSON.parse(t.track.colorPalette ?? '{}'),
				Album: albums,
				album: albums[0],
			};
		}) ?? [], 'name').sort(trackSort),
	};

	return res.json(results);
}
