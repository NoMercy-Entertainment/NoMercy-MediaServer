import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { Song } from '../../../types/music';
import { Track } from '@prisma/client';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const music = await confDb.artist.findFirst({
		where: {
			id: req.params.id,
		},
		include: {
			Track: {
				distinct: 'name',
				include: {
					Artist: true,
					Album: true,
					FavoriteTrack: true,
				},
			},
		},
	});

	try {
		if (music) {
			const result: any = {
				...music,
				// artist: [music],
				type: 'artist',
				Track: undefined,
				cover: music.cover ?? music.Track?.find(t => t.cover)?.cover ?? music.Track?.[0]?.Artist.find(t => t.cover)?.cover,
				colorPalette: JSON.parse(music.colorPalette ?? music.Track?.find(t => t.cover)?.colorPalette ?? music.Track?.[0]?.Artist.find(t => t.cover)?.colorPalette ?? "{}"),
				track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {
					
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
					const artists = t.Artist.filter(a => a.name != 'Various Artists').map(a => ({
						id: a.id,
						name: a.name,
						artistId: a.artistId,
						cover: a.cover ?? t.Album.find(t => t.cover)?.cover ?? t.Artist.find(t => t.cover)?.cover ?? null,
						description: a.description,
						folder: a.folder,
						libraryId: a.libraryId,
						origin: deviceId,
						colorPalette: undefined,
					}));
					
					return {
						...t,
						type: 'artist',
						favorite_track: t.FavoriteTrack.length > 0,
						artistId: music.artistId,
						origin: deviceId,
						artists: artists,
						cover: albums[0]?.cover ?? t.cover ?? null,
						folder: albums[0]?.folder ?? t.folder,
						Artist: undefined,
						Album: undefined,
						FavoriteTrack: undefined,
						libraryId: music.libraryId,
						colorPalette: undefined,
						album: albums[0],
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
		message: 'Nothing found for this artist',
	});

}
