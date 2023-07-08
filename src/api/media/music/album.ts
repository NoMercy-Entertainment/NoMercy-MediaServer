/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { deviceId } from '../../../functions/system';
import { selectAlbum } from '@/db/media/actions/albums';
import { requestWorker } from '@/api/requestWorker';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		user: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);

}

export const exec = ({ id, user }: { id: string; user: string; }) => {
	return new Promise((resolve, reject) => {
		const music = selectAlbum(id, user);

		if (!music) {
			return reject({
				message: 'You are not authorized to access this album',
				code: 401,
			});
		}

		const results = {
			...music,
			type: 'album',
			cover: music.cover?.replace('http://', 'https://'),
			colorPalette: JSON.parse(music.colorPalette ?? '{}'),
			blurHash: music.blurHash ?? null,

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

				return {
					...t.track,
					date: t.track.date,
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
					artist_track: artists,
					artist: artists[0],
				};
			}) ?? [], 'name').sort(trackSort),
			year: music.year,
			album_artist: music.description?.includes('Various Artists')
				? null
				: music.album_artist?.[0]
					? {
						id: music.album_artist?.[0].artist.id,
						name: music.album_artist?.[0].artist.name,
						cover: music.album_artist?.[0].artist.cover?.replace('http://', 'https://'),
						description: music.album_artist?.[0].artist.description,
						folder: music.album_artist?.[0].artist.folder,
						libraryId: music.album_artist?.[0].artist.library_id,
						origin: deviceId,
						colorPalette: JSON.parse(music.album_artist?.[0].artist.colorPalette ?? '{}'),
					}
					: null,
		};

		return resolve(results);
	});
};
