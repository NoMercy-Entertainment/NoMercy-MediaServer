import { Request, Response } from 'express';
import { trackSort, uniqBy } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response) {

	const language = req.acceptsLanguages()[0] == 'undefined'
		? 'en'
		: req.acceptsLanguages()[0].split('-')[0];

	const music = await confDb.album.findFirst({
		where: {
			id: req.params.id,
		},
		include: {
			_count: true,
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

			const results = {
				...music,
				type: 'album',
				Track: undefined,
				cover: music.cover,
				colorPalette: JSON.parse(music.colorPalette ?? '{}'),
				track: uniqBy<typeof music.Track>(music.Track.sort(trackSort), 'name').map((t) => {

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
						libraryId: music.libraryId,
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
						artistId: music.Artist[0]?.id,
						origin: deviceId,
						cover: (albums[0] ?? t).cover,
						libraryId: music.libraryId,
						colorPalette: JSON.parse((albums[0] ?? t).colorPalette ?? '{}'),
						FavoriteTrack: undefined,
						Artist: artists,
					};
				}),
				year: parseInt(year, 10),
				Artist: music.description?.includes('Various Artists')
					? null
					: music.Artist.map((a) => {
						return {
							...a,
							origin: deviceId,
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
		message: 'Nothing found for this album',
	});

}
