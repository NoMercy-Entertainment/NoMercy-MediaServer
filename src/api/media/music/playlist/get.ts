import { Request, Response } from 'express-serve-static-core';


export default function(req: Request, res: Response) {

	// try {

	// 	const music = await confDb.playlist.findFirst({
	// 		where: {
	// 			id: req.params.id,
	// 			userId: req.user.sub,
	// 		},
	// 		include: {
	// 			_count: true,
	// 			PlaylistTrack: {
	// 				include: {
	// 					track: {
	// 						include: {
	// 							Artist: true,
	// 							Album: true,
	// 							FavoriteTrack: {
	// 								where: {
	// 									userId: req.user.sub,
	// 								},
	// 								take: 800,
	// 							},
	// 						},
	// 					},
	// 				},
	// 				orderBy: {
	// 					updated_at: 'asc',
	// 				},
	// 			},
	// 		},
	// 	});

	// 	if (music) {
	// 		const results = {
	// 			type: 'playlist',
	// 			...music,
	// 			color_palette: JSON.parse(music.colorPalette ?? '{}'),
	// 			track: music.PlaylistTrack.map((t) => {

	// 				const albums = t.track.Album.map(a => ({
	// 					id: a.id,
	// 					name: a?.name,
	// 					folder: a?.folder,
	// 					cover: a?.cover ?? t.track.Artist[0]?.cover ?? t.track.cover ?? null,
	// 					description: a?.description,
	// 					libraryId: t.track.Artist[0].libraryId,
	// 					origin: deviceId,
	// 					color_palette: undefined,
	// 				}));
	// 				const artists = t.track.Artist.filter(a => a.name != 'Various Artists').map(a => ({
	// 					id: a.id,
	// 					name: a.name,
	// 					cover: a.cover ?? t.track.cover ?? t.track.cover ?? null,
	// 					description: a.description,
	// 					folder: a.folder,
	// 					libraryId: a.libraryId,
	// 					origin: deviceId,
	// 					color_palette: undefined,
	// 				}));

	// 				return {
	// 					...t.track,
	// 					type: 'artist',
	// 					artistId: artists[0].id,
	// 					origin: deviceId,
	// 					artists: artists,
	// 					cover: albums[0]?.cover ?? t.track.cover ?? null,
	// 					folder: albums[0]?.folder ?? t.track.folder,
	// 					Artist: undefined,
	// 					Album: undefined,
	// 					FavoriteTrack: undefined,
	// 					libraryId: t.track.Artist[0].libraryId,
	// 					color_palette: JSON.parse(t.track.colorPalette ?? '{}'),
	// 					album: albums[0],
	// 				};
	// 			}),
	// 		};

	// 		// @ts-ignore
	// 		results.PlaylistTrack = undefined;

	// 		return res.json(results);
	// 	}
	// 	const lists = await confDb.playlist
	// 		.findMany({
	// 			where: {
	// 				userId: req.user.sub,
	// 			},
	// 			include: {
	// 				_count: true,
	// 			},
	// 		});

	// 	const playlist = await confDb.playlist
	// 		.create({
	// 			data: {
	// 				name: req.body.name ?? `My playlist ${lists.length + 1}`,
	// 				description: '',
	// 				userId: req.user.sub,
	// 			},
	// 		});

	// 	return res.status(400).json(playlist);

	// } catch (error) {
	// 	console.log(error);
	// }

	return res.json({});
}
