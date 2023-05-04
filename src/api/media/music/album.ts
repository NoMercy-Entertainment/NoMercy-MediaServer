import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { AlbumResponse } from './album.d';
import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response): Promise<Response<AlbumResponse>> {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const music = await confDb.album.findFirst({
		where: {
			id: req.params.id,
		},
		include: {
			_count: true,
			Track: {
				distinct: ['name'],
				include: {
					Artist: true,
					Album: true,
					FavoriteTrack: {
						where: {
							userId: user,
						},
					},
				},
			},
			Artist: true,
		},
	});

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this album',
		});
	}

	const results: AlbumResponse = {
		...music,
		type: 'album',
		cover: music.cover?.replace('http://', 'https://'),
		colorPalette: JSON.parse(music.colorPalette ?? '{}'),
		Track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {

			const artists = t.Artist
				.filter(a => a.id != '89ad4ac3-39f7-470e-963a-56509c546377')
				.map(a => ({
					id: a.id,
					name: a.name,
					cover: (a.cover ?? t.Artist.find(t => t.cover)?.cover ?? null)?.replace('http://', 'https://'),
					description: a.description,
					folder: a.folder,
					libraryId: a.libraryId,
					origin: deviceId,
					colorPalette: a.colorPalette,
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
				...t,
				date: t.date && new Date(t.date)
					.toLocaleDateString(language, {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					}),
				type: 'album',
				lyrics: undefined,
				favorite_track: t.FavoriteTrack.length > 0,
				artistId: music.Artist[0]?.id,
				origin: deviceId,
				cover: t.cover?.replace('http://', 'https://'),
				libraryId: music.libraryId,
				colorPalette: JSON.parse(t.colorPalette ?? '{}'),
				FavoriteTrack: undefined,
				Artist: artists,
			};
		}),
		year: music.year,
		Artist: music.description?.includes('Various Artists')
			? null
			: music.Artist.map((a) => {
				return {
					...a,
					origin: deviceId,
					cover: a.cover?.replace('http://', 'https://'),
				};
			}),
	};

	return res.json(results);
}
