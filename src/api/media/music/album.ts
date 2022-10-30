import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const music = await confDb.album.findFirst({
		where: {
			id: req.params.id,
		},
		include: {
			Track: {
				include: {
					Artist: true,
					Album: true,
					FavoriteTrack: true,
				},
			},
			Artist: true,
		},
	});


	try {
		if (music) {
			const year: string = (music.year ?? music.description?.match(/\d+/u)?.[0] ?? '0').toString();

			const result = {
				...music,
				type: 'album',
				Track: undefined,
				Artist: undefined,
				cover: music.cover,
				colorPalette: JSON.parse(music.colorPalette ?? "{}"),
				track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {
					
					const artists = t.Artist.filter(a => a.name != 'Various Artists').map(a => ({
						id: a.id,
						name: a.name,
						artistId: a.artistId,
						cover: a.cover ?? t.Artist.find(t => t.cover)?.cover ?? null,
						description: a.description,
						folder: a.folder,
						libraryId: a.libraryId,
						origin: deviceId,
						colorPalette: undefined,
					}));
					const albums = t.Album.map(a => ({
						id: a.id,
						name: a?.name,
						folder: a?.folder,
						albumId: a?.albumId,
						cover: a?.cover ?? t.Artist[0]?.cover ?? t.cover ?? null,
						description: a?.description,
						libraryId: music.libraryId,
						origin: deviceId,
						colorPalette: undefined,
					}));

					return {
						...t,
						type: 'album',
						favorite_track: t.FavoriteTrack.length > 0,
						artistId: music.Artist[0]?.id,
						origin: deviceId,
						cover: albums[0].cover ?? t.cover,
						folder: albums[0].folder ?? t.folder,
						libraryId: music.libraryId,
						colorPalette: undefined,
						artists: artists,
						Artist: undefined,
						FavoriteTrack: undefined,
						artist: artists[0],
					};
				}),
				year: parseInt(year, 10),
				artist: music.description?.includes('Various Artists') ? null : music.Artist.map((a) => {
					return {
						...a,
						origin: deviceId,
					};
				}),
			};
			return res.json(result);
		}
	} catch (error) {
		console.log(error);
	}
	
	return res.json({
		status: 'error',
		message: 'Nothing found for this album',
	});

}
