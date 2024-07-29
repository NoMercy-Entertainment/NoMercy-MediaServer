import { Request, Response } from 'express-serve-static-core';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (req: Request, res: Response) => {

	// const query = req.body.query as string;

	try {
		// const artists = await confDb.artist.findMany({
		// 	where: {
		// 		OR: [
		// 			{
		// 				AND: {
		// 					NOT: {
		// 						track: {
		// 							none: {},
		// 						},
		// 					},
		// 					name: {
		// 						contains: query,
		// 					},
		// 				},
		// 			},
		// 		],
		// 	},
		// 	include: {
		// 		track: {
		// 			include: {
		// 				Artist: true,
		// 				Album: true,
		// 			},
		// 		},
		// 		Album: true,
		// 	},
		// 	take: 8,
		// });

		// let tracks = await confDb.track.findMany({
		// 	where: {
		// 		name: {
		// 			contains: query,
		// 		},
		// 	},
		// 	include: {
		// 		Artist: true,
		// 		Album: true,
		// 		FavoriteTrack: true,
		// 	},
		// 	orderBy: {
		// 		name: 'asc',
		// 	},
		// 	take: 4,
		// });

		// const albums = await confDb.album.findMany({
		// 	where: {
		// 		OR: [
		// 			{
		// 				name: {
		// 					contains: query,
		// 				},
		// 				Artist: {
		// 					every: {
		// 						NOT: {},
		// 					},
		// 				},
		// 			},
		// 			{
		// 				AND: {
		// 					NOT: {
		// 						description: {
		// 							contains: 'Various Artists',
		// 						},
		// 						Artist: {
		// 							every: {
		// 								NOT: {},
		// 							},
		// 						},
		// 					},
		// 					Artist: {
		// 						some: {
		// 							name: {
		// 								contains: query,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 		],
		// 	},
		// 	include: {
		// 		track: {
		// 			include: {
		// 				Artist: true,
		// 			},
		// 			orderBy: {
		// 				date: 'desc',
		// 			},
		// 		},
		// 		Artist: true,
		// 	},
		// 	take: 8,
		// });

		// type Track2 = track & {
		// 	Album: Album[];
		// 	Artist: Artist[];
		// };

		// const tracks2: Track2[] = [];

		// artists.map(t => t.track).map((a) => {
		// 	a.map((b) => {
		// 		tracks2.push(b);
		// 	});
		// });

		// tracks = Object.values({
		// 	...shuffle(tracks2),
		// 	...tracks,
		// })
		// 	.slice(0, 5);

		// const playlists = await confDb.playlistTrack.findMany({
		// 	where: {
		// 		OR: [
		// 			{
		// 				Playlist: {
		// 					userId: req.user.sub,
		// 				},
		// 				track: {
		// 					Artist: {
		// 						some: {
		// 							name: {
		// 								contains: query,
		// 							},
		// 						},
		// 					},
		// 				},
		// 			},
		// 			{
		// 				Playlist: {
		// 					userId: req.user.sub,
		// 				},
		// 				track: {
		// 					name: {
		// 						contains: query,
		// 					},
		// 				},
		// 			},
		// 		],
		// 	},
		// 	include: {
		// 		Playlist: true,
		// 	},
		// 	take: 8,
		// });

		// let best: any = {};

		// if (artists.some(a => a.name.toLowerCase() == query.toLowerCase())) {
		// 	best = artists.find(a => a.name.toLowerCase() == query.toLowerCase());
		// 	best.type = 'artist';
		// 	best.cover = best.cover ?? best.Album[0]?.cover ?? null;
		// } else if (artists.some(a => a.name.toLowerCase().includes(query.toLowerCase()))) {
		// 	best = artists.find(a => a.name.toLowerCase().includes(query.toLowerCase()));
		// 	best.type = 'artist';
		// 	best.cover = best.cover ?? best.Album[0]?.cover ?? null;
		// } else if (tracks.some(a => a.name.toLowerCase() == query.toLowerCase())) {
		// 	best = tracks.find(a => a.name.toLowerCase() == query.toLowerCase());
		// 	best.type = 'track';
		// 	best.cover = best.cover?.includes('Music/')
		// 		? best.cover
		// 		: (`${best.folder}/${best.cover}`);
		// } else if (tracks.some(a => a.name.toLowerCase().includes(query.toLowerCase()))) {
		// 	best = tracks.find(a => a.name.toLowerCase().includes(query.toLowerCase()));
		// 	best.type = 'track';
		// 	best.cover = best.cover?.includes('Music/')
		// 		? (`${best.folder}/${best.cover}`)
		// 		: best.cover;
		// } else if (albums.some(a => a.name.toLowerCase() == query.toLowerCase())) {
		// 	best = albums.find(a => a.name.toLowerCase() == query.toLowerCase());
		// 	best.type = 'album';
		// } else if (albums.some(a => a.name.toLowerCase().includes(query.toLowerCase()))) {
		// 	best = albums.find(a => a.name.toLowerCase().includes(query.toLowerCase()));
		// 	best.type = 'album';
		// } else if (playlists.some(a => a.Playlist.name.toLowerCase() == query.toLowerCase())) {
		// 	const playlist = playlists.find(a => a.Playlist.name.toLowerCase() == query.toLowerCase())!.Playlist;
		// 	best = {
		// 		...playlist,
		// 		id: playlist.id,
		// 		userId: playlist.userId,
		// 		name: playlist.name,
		// 		description: playlist.description,
		// 		cover: playlist.cover,
		// 		created_at: playlist.created_at,
		// 		updated_at: playlist.updated_at,
		// 		color_palette: JSON.parse(playlist.colorPalette ?? '{}'),
		// 		type: 'playlist',
		// 	};
		// } else if (playlists.some(a => a.Playlist.name.toLowerCase().includes(query.toLowerCase()))) {
		// 	const playlist = playlists.find(a => a.Playlist.name.toLowerCase().includes(query.toLowerCase()))!.Playlist;
		// 	if (playlist != null) {
		// 		best = {
		// 			...playlist,
		// 			id: playlist.id,
		// 			userId: playlist.userId,
		// 			name: playlist.name,
		// 			description: playlist.description,
		// 			cover: playlist.cover,
		// 			created_at: playlist.created_at,
		// 			updated_at: playlist.updated_at,
		// 			color_palette: JSON.parse(playlist.colorPalette ?? '{}'),
		// 			type: 'playlist',
		// 		};
		// 	}
		// }

		// const data = {
		// 	best: best,
		// 	artists: {
		// 		moreLink: `/music/search/${query}/artist`,
		// 		items: artists.map((t) => {
		// 			return {
		// 				...t,
		// 				type: 'artist',
		// 				track: undefined,
		// 				Album: undefined,
		// 				album: t.Album,
		// 				name: t.name.replace(/["'\[\]*]/gu, ''),
		// 				title_sort: createTitleSort(t.name.replace(/["'\[\]*]/gu, '')),
		// 				origin: deviceId,
		// 				color_palette: JSON.parse(t.colorPalette ?? '{}'),
		// 			};
		// 		}),
		// 	},
		// 	track: {
		// 		moreLink: `/music/search/${query}/track`,
		// 		items: tracks?.map((t) => {
		// 			// const cover = t.cover?.includes('Music/')
		// 			// 	? t.cover
		// 			// 	: (`${t.folder}/${t.cover}`);
		// 			return {
		// 				...t,
		// 				type: 'track',
		// 				moreLink: '',
		// 				track: undefined,
		// 				libraryId: t.Album[0]?.libraryId ?? t.Artist[0]?.libraryId,
		// 				Artist: t.Artist,
		// 				Album: t.Album,
		// 				cover: t.Album[0]?.cover ?? t.Artist[0]?.cover,
		// 				color_palette: JSON.parse(t.Album[0]?.colorPalette ?? t.Artist[0]?.colorPalette ?? '{}'),
		// 			};
		// 		}),
		// 	},
		// 	albums: {
		// 		moreLink: `/music/search/${query}/album`,
		// 		items: uniqBy(albums.map((a) => {
		// 			return {
		// 				...a,
		// 				type: 'album',
		// 				moreLink: '',
		// 				track: undefined,
		// 				Artist: a.Artist,
		// 				items: a.track,
		// 				color_palette: JSON.parse(a.colorPalette ?? '{}'),
		// 			};
		// 		}), 'name'),
		// 	},
		// 	playlists: {
		// 		moreLink: `/music/search/${query}/playlist`,
		// 		items: uniqBy(playlists.map((p: any) => {
		// 			const playlist = p.Playlist;
		// 			p.playlist = undefined;
		// 			return {
		// 				...p,
		// 				id: playlist.id,
		// 				userId: playlist.userId,
		// 				name: playlist.name,
		// 				description: playlist.description,
		// 				cover: playlist.cover,
		// 				created_at: playlist.created_at,
		// 				updated_at: playlist.updated_at,
		// 				type: 'playlist',
		// 				moreLink: '',
		// 				track: undefined,
		// 				items: p.track,
		// 				color_palette: JSON.parse(playlist.colorPalette ?? '{}'),
		// 			};
		// 		}), 'playlistId'),
		// 	},
		// };

		// res.json(data);

	} catch (error) {
		console.log(error);
	}

};
