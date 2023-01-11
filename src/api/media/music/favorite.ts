import { Request, Response } from 'express';

import { KAuthRequest } from '../../../types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] == 'undefined'
		? 'en'
		: req.acceptsLanguages()[0].split('-')[0];

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
					FavoriteTrack: true,
				},
			},
		},
	});

	if (!music) { return; }

	if (music) {
		const results: any = {
			cover: 'favorites',
			description: null,
			name: 'Songs you like',
			type: 'playlist',
			// colorPalette: JSON.parse(music.colorPalette ?? ""),
			track: music.map((t) => {
				return {
					...t.Track,
					type: 'track',
					date: t.Track.date && new Date(t.updated_at)
						.toLocaleDateString(language, {
							year: 'numeric',
							month: 'short',
							day: '2-digit',
						}),
					favorite_track: t.Track.FavoriteTrack.length > 0,
					libraryId: t.Track.Album[0].libraryId,
					artistId: t.Track.Artist[0].id,
					origin: deviceId,
					artists: t.Track.Artist,
					cover: t.Track.Album[0].cover,
					colorPalette: JSON.parse(t.Track.Album[0].colorPalette ?? '{}'),
					Artist: {
						id: t.Track.Artist[0].id,
						name: t.Track.Artist[0].name,
						cover: t.Track.Artist[0].cover,
						description: t.Track.Artist[0].description,
						folder: t.Track.Artist[0].folder,
						colorPalette: undefined,
					},
					Album: {
						id: t.Track.Album[0]?.id,
						name: t.Track.Album[0]?.name,
						cover: t.Track.Album[0]?.cover,
						description: t.Track.Album[0]?.description,
						colorPalette: undefined,
					},
				};
			}),
		};
		return res.json(results);
	}


	return res.json({});


}
