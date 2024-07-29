import { Request, Response } from 'express-serve-static-core';
import { eq } from 'drizzle-orm';
import { shuffle } from '@server/functions/stringArray';

import { Album } from '@server/db/media/actions/albums';
import { AlbumMusicGenre } from '@server/db/media/actions/album_musicGenre';
import { Artist } from '@server/db/media/actions/artists';
import { ArtistMusicGenre } from '@server/db/media/actions/artist_musicGenre';
// import { MusicGenre } from '@server/db/media/actions/musicGenres';
// import { MusicGenreTrack } from '@server/db/media/actions/musicGenre_track';
// import { Track } from '@server/db/media/actions/tracks';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { deviceId } from '@server/functions/system';
import { users } from '@server/db/media/schema/users';
import type { PaletteColors } from '@server/types/server';
import { track_user } from '@server/db/media/schema/track_user';

export default function(req: Request, res: Response) {

	// const genres: MusicGenre[] = [];
	// const playlistsItems: Playlist[] = [];
	// const trackItems: (Track & {
	// 	musicGenre_track: (MusicGenreTrack & {
	// 		musicGenre: MusicGenre;
	// 	})[];
	// })[] = [];

	const albumItems: (AlbumMusicGenre & {
		album: Album;
	})[] = [];

	const artistItems: (ArtistMusicGenre & {
		artist: Artist & {
			artist_track: {
				track_id: string;
			}[];
		};
	})[] = [];

	// // @ts-ignore
	// const musicGenreData = globalThis.mediaDb.query.musicGenres.findMany({
	// }) as MusicGenre[];
	// genres.push(...musicGenreData);

	// const genreItems: any[] = [];

	// @ts-ignore
	// const playlistData = globalThis.mediaDb.query.playlists.findMany({
	// 	where: eq(users.id, req.user.sub),
	// 	limit: 26,
	// }) as Playlist[];
	// playlistsItems.push(...playlistData);

	// // @ts-ignore
	// const tracksData = globalThis.mediaDb.query.tracks.findMany({
	// 	where: isNotNull(tracks.cover),
	// 	with: {
	// 		musicGenre_track: {
	// 			with: {
	// 				musicGenre: true,
	// 			},
	// 		},
	// 	},
	// }) as (Track & {
	// 	musicGenre_track: (MusicGenreTrack & {
	// 		musicGenre: MusicGenre;
	// 	})[];
	// })[];
	// trackItems.push(...tracksData);

	// @ts-ignore
	const albumData = globalThis.mediaDb.query.album_musicGenre.findMany({
		with: {
			album: true,
		},
	}) as (AlbumMusicGenre & {
		album: Album;
	})[];
	albumItems.push(...albumData);

	// @ts-ignore
	const artistData = globalThis.mediaDb.query.artist_musicGenre.findMany({
		with: {
			artist: {
				with: {
					artist_track: {
						columns: {
							track_id: true,
						},
					},
				},
			},
		},
	});
	artistItems.push(...artistData);

	const favoriteArtists = globalThis.mediaDb.query.artist_user.findMany({
		where: (artist_user, { eq }) => eq(artist_user.user_id, req.user.sub),
		with: {
			artist: {
				with: {
					artist_track: {
						columns: {
							track_id: true,
						},
					},
				},

			},
		},
	});

	const favoriteAlbums = globalThis.mediaDb.query.album_user.findMany({
		where: (album_user, { eq }) => eq(album_user.user_id, req.user.sub),
		with: {
			album: true,
		},
	});

	// @ts-ignore
	const playlists = globalThis.mediaDb.query.playlists.findMany({
		where: eq(users.id, req.user.sub),
		limit: 26,
		with: {
			playlist_track: {
				columns: {
					track_id: true,
				},
			},
		},
	});

	const favoriteTracks = globalThis.mediaDb.query.track_user.findMany({
		where: eq(track_user.user_id, req.user.sub),
		with: {
			track: {
				columns: {
					id: true,
				},
			},
		},
	});

	// const recentlyPlayed = globalThis.mediaDb.query.music_plays.findMany({
	// 	where: (music_plays, {eq}) => eq(music_plays.user_id, req.user.sub),
	// 	with: {
	// 		track: {
	// 			with: {
	// 				musicGenre_track: {
	// 					with: {
	// 						musicGenre: true,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	orderBy: desc(music_plays.created_at),
	// 	limit: 50,
	// });

	// try {

	// 	genres.map((g) => {
	// 		const x = trackItems
	// 			.filter(d => d.musicGenre_track.some(m => m.musicGenre_id == g.id))
	// 			.map((d, index) => {

	// 				const artist = shuffle(artistItems).find(a => d.musicGenre_track.some(m => m.musicGenre.id == a.musicGenre_id));
	// 				const album = shuffle(albumItems).find(a => d.musicGenre_track.some(m => m.musicGenre.id == a.musicGenre_id));

	// 				if (index % 2 == 0) {
	// 					return {
	// 						...artist?.artist,
	// 						album: album?.album,
	// 						type: 'artist',
	// 						libraryId: artist?.artist?.library_id,
	// 						color_palette: JSON.parse(artist?.artist?.colorPalette ?? '{}'),
	// 						tracks: artist?.artist?.artist_track?.length,
	// 					};
	// 				}
	// 				return {
	// 					...album?.album,
	// 					artist: artist?.artist,
	// 					type: 'album',
	// 					libraryId: album?.album?.library_id,
	// 					color_palette: JSON.parse(album?.album?.colorPalette ?? '{}'),
	// 					tracks: album?.album?.tracks ?? artist?.artist?.artist_track?.length ?? 0,
	// 				};
	// 			})
	// 			.filter(d => !!d.id);

	// 		if (x.length > 13) {
	// 			genreItems.push({
	// 				title: g.name,
	// 				moreLink: `/music/genre/${g.id}`,
	// 				items: x,
	// 			});
	// 		}
	// 	});

	// } catch (error) {
	// 	console.log(error);
	// }

	const response: HomeData[] = [
		{
			title: 'Favorite Artists',
			moreLink: '',
			items: favoriteArtists.map((m) => {
				return {
					...m.artist,
					type: 'artist',
					name: m.artist.name.replace(/["'\[\]*]/gu, ''),
					title_sort: createTitleSort(m.artist.name.replace(/["'\[\]*]/gu, '')),
					origin: deviceId,
					color_palette: JSON.parse(m.artist.colorPalette ?? '{}'),
					libraryId: m.artist.library_id,
					tracks: m.artist.artist_track.length,
				};
			}),
		},
		{
			title: 'Favorite Albums',
			moreLink: '',
			items: favoriteAlbums.map((m) => {
				return {
					...m.album,
					type: 'album',
					name: m.album.name.replace(/["'\[\]*]/gu, ''),
					title_sort: createTitleSort(m.album.name.replace(/["'\[\]*]/gu, ''), m.album.year),
					origin: deviceId,
					color_palette: JSON.parse(m.album.colorPalette ?? '{}'),
					libraryId: m.album.library_id,
				};
			}),
		},
		{
			title: 'Playlists',
			moreLink: '/music/collection/playlists',
			items: playlists.map((m) => {
				return {
					...m,
					type: 'playlist',
					name: m.name.replace(/["'\[\]*]/gu, ''),
					title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
					origin: deviceId,
					color_palette: JSON.parse(m.colorPalette ?? '{}'),
					tracks: m.playlist_track.length,
				};
			}),
		},
		{
			title: 'Artists',
			moreLink: '/music/collection/artists',
			items: shuffle(artistItems)
				.filter(d => !!d.artist)
				.slice(0, 26)
				.map((m) => {
					console.log(m);
					return {
						...m.artist,
						type: 'artist',
						name: m.artist?.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.artist?.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
						color_palette: JSON.parse(m.artist?.colorPalette ?? '{}'),
						tracks: m?.artist?.artist_track?.length,
						libraryId: m.artist.library_id,
					};
				}),
		},
		{
			title: 'Albums',
			moreLink: '/music/collection/albums',
			items: shuffle(albumItems)
				.slice(0, 26)
				.map((m) => {
					return {
						...m.album,
						type: 'album',
						name: m.album.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.album.name.replace(/["'\[\]*]/gu, ''), m.album.year),
						origin: deviceId,
						color_palette: JSON.parse(m.album.colorPalette ?? '{}'),
						tracks: m.album.tracks,
						libraryId: m.album.library_id,
					};
				}),
		},
		// ...genreItems.filter(d => d.items.length > 90).map(d => ({ ...d, items: d.items.slice(0, 26) })),
	];

	return res.json(response);

}

export interface HomeData {
	title: string;
	moreLink: string;
	items: HomeDataItem[];
}

export interface HomeDataItem {
	id: string | undefined | null;
	name: string;
	description: string | null;
	cover: null | string;
	colorPalette?: PaletteColors;
	blurHash: null | string;
	type: string;
	title_sort?: string;
	origin?: string;
	year?: number | null;
	tracks?: number | undefined | null;
	Artist?: Artist[];
	Album?: Album[];
}
