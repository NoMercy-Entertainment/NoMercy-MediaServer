import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] == 'undefined'
		? 'en'
		: req.acceptsLanguages()[0].split('-')[0];

	const music = await confDb.artist.findFirst({
		where: {
			id: req.params.id,
		},
		include: {
			_count: true,
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
			const results: any = {
				...music,
				type: 'artist',
				Track: undefined,
				cover: music.cover ?? music.Track?.find(t => t.cover)?.cover ?? music.Track?.[0]?.Artist.find(t => t.cover)?.cover,
				colorPalette: JSON.parse(music.colorPalette ?? music.Track?.find(t => t.cover)?.colorPalette ?? music.Track?.[0]?.Artist.find(t => t.cover)?.colorPalette ?? '{}'),
				track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {

					const albums = t.Album.map(a => ({
						id: a.id,
						name: a?.name,
						folder: a?.folder,
						cover: a?.cover ?? t.Artist[0]?.cover ?? t.cover ?? null,
						description: a?.description,
						libraryId: music.libraryId,
						origin: deviceId,
						colorPalette: a.colorPalette,
					}));
					const artists = t.Artist.filter(a => a.id != '89ad4ac3-39f7-470e-963a-56509c546377').map(a => ({
						id: a.id,
						name: a.name,
						cover: a.cover ?? t.Album.find(t => t.cover)?.cover ?? t.Artist.find(t => t.cover)?.cover ?? null,
						description: a.description,
						folder: a.folder,
						libraryId: a.libraryId,
						origin: deviceId,
						colorPalette: a.colorPalette,
					}));

					return {
						...t,
						lyrics: undefined,
						date: t.date && new Date(t.date)
							.toLocaleDateString(language, {
								year: 'numeric',
								month: 'short',
								day: '2-digit',
							}),
						type: 'artist',
						favorite_track: t.FavoriteTrack.length > 0,
						origin: deviceId,
						Artist: artists,
						cover: (albums[0] ?? t).cover ?? null,
						folder: (albums[0] ?? t).folder,
						FavoriteTrack: undefined,
						libraryId: music.libraryId,
						colorPalette: JSON.parse((albums[0] ?? t).colorPalette ?? '{}'),
						Album: albums,
					};
				}),
			};
			return res.json(results);
		}

	} catch (error) {
		console.log(error);
	}

	return res.json({
		status: 'error',
		message: 'Nothing found for this artist',
	});

}
