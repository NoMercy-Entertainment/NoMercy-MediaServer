import { Request, Response } from 'express';

import { FavoritesResponse } from './favorite.d';
import { KAuthRequest } from '../../../types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response): Promise<Response<FavoritesResponse>> {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const music = await confDb.favoriteTrack.findMany({
		where: {
			userId: user,
		},
		include: {
			Track: {
				include: {
					Artist: true,
					Album: true,
				},
			},
		},
	});

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

			const artists = t.Track.Artist.filter(a => a.id != '89ad4ac3-39f7-470e-963a-56509c546377').map(a => ({
				id: a.id,
				name: a.name,
				cover: a.cover ?? t.Track.Artist.find(t => t.cover)?.cover ?? null,
				description: a.description,
				folder: a.folder,
				libraryId: a.libraryId,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));
			const albums = t.Track.Album.map(a => ({
				id: a.id,
				name: a?.name,
				folder: a?.folder,
				cover: a?.cover ?? t.Track.Artist[0]?.cover ?? t.Track.cover ?? null,
				description: a?.description,
				libraryId: a.libraryId,
				origin: deviceId,
				colorPalette: JSON.parse(a.colorPalette ?? '{}'),
			}));

			return {
				...t.Track,
				type: 'track',
				date: t.Track.date && new Date(t.updated_at)
					.toLocaleDateString(language, {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					}),
				lyrics: undefined,
				favorite_track: true,
				libraryId: t.Track.Album[0].libraryId,
				artistId: t.Track.Artist[0].id,
				origin: deviceId,
				artists: t.Track.Artist,
				cover: t.Track.Album[0].cover,
				colorPalette: JSON.parse(t.Track.Album[0].colorPalette ?? '{}'),
				Artist: artists,
				Album: albums,
			};
		}),
	};

	return res.json(results);

}
