import { Request, Response } from 'express';
import { sortBy, uniqBy } from '../../../functions/stringArray';

import { GenreResponse } from './genre.d';
import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response): Promise<Response<GenreResponse>> {

	const language = getLanguage(req);

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const music = await confDb.musicGenre.findFirst({
		where: {
			id: req.params.id,
			Track: {
				some: {
					id: {
						not: undefined,
					},
				},
			},
		},
		include: {
			_count: true,
			Track: {
				orderBy: {
					id: 'asc',
				},
				include: {
					Album: true,
					Artist: true,
					FavoriteTrack: {
						where: {
							userId: user,
						},
					},
					_count: true,
				},
			},
		},
	});

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this genre',
		});
	}

	const result: GenreResponse = {
		...music,
		type: 'genre',
		name: music.name?.replace(/["'\[\]*]/gu, '') ?? '',
		titleSort: createTitleSort(music.name?.replace(/["'\[\]*]/gu, '') ?? ''),
		origin: deviceId,
		Track: sortBy(uniqBy<typeof music.Track>(music.Track, 'name'), 'id').map((t) => {

			const artists = t.Artist.filter(a => a.id != '89ad4ac3-39f7-470e-963a-56509c546377').map(a => ({
				id: a.id,
				name: a.name,
				cover: a.cover ?? t.Artist.find(t => t.cover)?.cover ?? null,
				description: a.description,
				folder: a.folder,
				libraryId: a.libraryId,
				origin: deviceId,
				colorPalette: a.colorPalette,
			}));
			const albums = t.Album.map(a => ({
				id: a.id,
				name: a?.name,
				folder: a?.folder,
				cover: a?.cover ?? t.Artist[0]?.cover ?? t.cover ?? null,
				description: a?.description,
				libraryId: t.Album[0].libraryId,
				origin: deviceId,
				colorPalette: a.colorPalette,
			}));

			return {
				...t,
				date: t.date && new Date(t.date)
					.toLocaleDateString(language, {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					}),
				lyrics: undefined,
				type: 'album',
				favorite_track: t.FavoriteTrack.length > 0,
				artistId: t.Artist[0]?.id,
				origin: deviceId,
				cover: (albums[0] ?? t).cover,
				libraryId: t.Album[0].libraryId,
				colorPalette: JSON.parse((albums[0] ?? t).colorPalette ?? '{}'),
				FavoriteTrack: undefined,
				Artist: artists,
			};
		}),
	};

	return res.json(result);
}
