import { Request, Response } from 'express';

import { KAuthRequest } from '../../../types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

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
		const result: any = {
			cover: 'favorites',
			description: null,
			name: 'Songs you like',
			type: 'playlist',
			// colorPalette: JSON.parse(music.colorPalette ?? ""),
			track: music.map((t) => {
				return {
					...t.Track,
					type: 'track',
					date: t.updated_at,
					favorite_track: t.Track.FavoriteTrack.length > 0,
					libraryId: t.Track.Album[0].libraryId,
					artistId: t.Track.Artist[0].artistId,
					origin: deviceId,
					artists: t.Track.Artist,
					cover: t.Track.Album[0].cover,
					colorPalette: JSON.parse(t.Track.Album[0].colorPalette ?? ""),
					Artist: undefined,
					Album: undefined,
					artist: {
						id: t.Track.Artist[0].id,
						name: t.Track.Artist[0].name,
						artistId: t.Track.Artist[0].id,
						cover: t.Track.Artist[0].cover,
						description: t.Track.Artist[0].description,
						folder: t.Track.Artist[0].folder,
						colorPalette: undefined,
					},
					album: {
						id: t.Track.Album[0]?.id,
						name: t.Track.Album[0]?.name,
						albumId: t.Track.Album[0]?.albumId,
						cover: t.Track.Album[0]?.cover,
						description: t.Track.Album[0]?.description,
						colorPalette: undefined,
					},
				};
			}),
		};
		return res.json(result);
	}


	return res.json({});


}
