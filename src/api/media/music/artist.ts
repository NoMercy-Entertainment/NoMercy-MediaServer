import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { ArtistResponse } from './artist.d';
import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response): Promise<Response<ArtistResponse>> {
	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const music = await confDb.artist.findFirst({
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
		},
	});

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this artist',
		});
	}

	const results: ArtistResponse = {
		...music,
		type: 'artist',
		cover: (music.cover ?? music.Track?.find(t => t.cover)?.cover ?? music.Track?.[0]?.Artist.find(t => t.cover)?.cover)?.replace(
			'http://',
			'https://'
		),

		colorPalette: JSON.parse(
			music.colorPalette
			?? music.Track?.find(t => t.cover)?.colorPalette
			?? music.Track?.[0]?.Artist.find(t => t.cover)?.colorPalette
			?? '{}'
		),

		blurHash: music.blurHash
			?? music.Track?.find(t => t.cover)?.blurHash
			?? music.Track?.[0]?.Artist.find(t => t.cover)?.blurHash
			?? null,

		Track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {
			const albums = t.Album.map(a => ({
				id: a.id,
				name: a?.name,
				folder: a?.folder,
				cover: (a?.cover ?? t.Artist[0]?.cover ?? t.cover ?? null)?.replace('http://', 'https://'),
				description: a?.description,
				libraryId: music.libraryId,
				origin: deviceId,
				colorPalette: undefined,
			}));
			const artists = t.Artist.filter(a => a.id != '89ad4ac3-39f7-470e-963a-56509c546377').map(a => ({
				id: a.id,
				name: a.name,
				cover: (a.cover ?? t.Album.find(t => t.cover)?.cover ?? t.Artist.find(t => t.cover)?.cover ?? null)?.replace('http://', 'https://'),
				description: a.description,
				folder: a.folder,
				libraryId: a.libraryId,
				origin: deviceId,
				colorPalette: undefined,
			}));

			return {
				...t,
				date:
					t.date
					&& language
					&& new Date(t.date).toLocaleDateString(language, {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
					}),
				type: 'artist',
				lyrics: undefined,
				favorite_track: t.FavoriteTrack.length > 0,
				origin: deviceId,
				Artist: artists,
				cover: (t.cover ?? null)?.replace('http://', 'https://'),
				FavoriteTrack: undefined,
				libraryId: music.libraryId,
				blurHash: t.blurHash,
				colorPalette: JSON.parse(t.colorPalette ?? '{}'),
				Album: albums,
				album: albums[0],
			};
		}),
	};

	return res.json(results);
}
