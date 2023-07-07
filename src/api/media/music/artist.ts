/* eslint-disable prefer-promise-reject-errors */
import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { deviceId } from '../../../functions/system';
import { selectArtist } from '@/db/media/actions/artists';
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

		const music = selectArtist(id, user);

		if (!music) {
			return reject({
				message: 'You are not authorized to access this artist',
				code: 401,
			});
		}

		try {
			const results = {
				...music,
				type: 'artist',
				cover: music.cover,

				colorPalette: JSON.parse(music.colorPalette ?? '{}'),
				blurHash: music.blurHash ?? null,

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
						date: t.track.date,
						type: 'artist',
						lyrics: typeof t.track.lyrics === 'string' && t.track.lyrics.includes('{')
							? JSON.parse(t.track.lyrics)
							: t.track.lyrics,
						favorite_track: t.track.track_user.length > 0,
						origin: deviceId,
						cover: (t.track.cover ?? null)?.replace('http://', 'https://'),
						libraryId: t.track.folder_id,
						blurHash: t.track.blurHash,
						colorPalette: JSON.parse(t.track.colorPalette ?? '{}'),
						album_track: albums,
						artist_track: artists,
						album: albums[0],
					};
				}) ?? [], 'name').sort(trackSort),
			};

			return resolve(results);
		} catch (error) {
			console.error(error);
		}
	});
};
