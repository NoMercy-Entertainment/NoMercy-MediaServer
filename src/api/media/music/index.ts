import { AlbumMusicGenre } from '@server/db/media/actions/album_musicGenre';
import { Album } from '@server/db/media/actions/albums';
import { ArtistMusicGenre } from '@server/db/media/actions/artist_musicGenre';
import { Artist } from '@server/db/media/actions/artists';
import { MusicGenreTrack } from '@server/db/media/actions/musicGenre_track';
import { MusicGenre } from '@server/db/media/actions/musicGenres';
import { Playlist } from '@server/db/media/actions/playlists';
import { Track } from '@server/db/media/actions/tracks';
import { UserData } from '@server/db/media/actions/userData';
import { tracks } from '@server/db/media/schema/tracks';
import { userData } from '@server/db/media/schema/userData';
import { users } from '@server/db/media/schema/users';
import { shuffle, unique } from '@server/functions/stringArray';
import { deviceId } from '@server/functions/system';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { Request, Response } from 'express-serve-static-core';

export default function (req: Request, res: Response) {

	const genres: MusicGenre[] = [];
	const playlistsItems: Playlist[] = [];
	const userDataItems: UserData[] = [];
	const trackItems: (Track & {
		musicGenre_track: (MusicGenreTrack & {
			musicGenre: MusicGenre;
		})[];
	})[] = [];

	const albumItems: (AlbumMusicGenre & {
		album: Album;
	})[] = [];

	const artistItems: (ArtistMusicGenre & {
		artist: Artist;
	})[] = [];

	// @ts-ignore
	const musicGenreData = globalThis.mediaDb.query.musicGenres.findMany({
	}) as MusicGenre[];
	genres.push(...musicGenreData);

	const genreItems: any[] = [];

	// @ts-ignore
	const playlistData = globalThis.mediaDb.query.playlists.findMany({
		where: eq(users.id, req.user.sub),
		limit: 14,
	}) as Playlist[];
	playlistsItems.push(...playlistData);

	// @ts-ignore
	const userDataData = globalThis.mediaDb.query.userData.findMany({
		where: and(
			eq(userData.user_id, req.user.sub),
			isNotNull(userData.isFavorite)
		),
		limit: 14,
		orderBy: desc(userData.updated_at),
	}) as UserData[];
	userDataItems.push(...userDataData);

	// @ts-ignore
	const tracksData = globalThis.mediaDb.query.tracks.findMany({
		where: isNotNull(tracks.cover),
		with: {
			musicGenre_track: {
				with: {
					musicGenre: true,
				},
			},
		},
	}) as (Track & {
		musicGenre_track: (MusicGenreTrack & {
			musicGenre: MusicGenre;
		})[];
	})[];
	trackItems.push(...tracksData);

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
			artist: true,
		},
	}) as (ArtistMusicGenre & {
		artist: Artist;
	})[];
	artistItems.push(...artistData);

	try {

		genres.map((g) => {
			const x = shuffle(unique(trackItems
				.filter(d => d.musicGenre_track.some(m => m.musicGenre_id == g.id))
				.map((d, index) => {

					const artist = shuffle(artistItems).find(a => d.musicGenre_track.some(m => m.musicGenre.id == a.musicGenre_id));
					const album = shuffle(albumItems).find(a => d.musicGenre_track.some(m => m.musicGenre.id == a.musicGenre_id));

					if (index % 2 == 0) {
						return {
							...artist?.artist,
							album: album?.album,
							type: 'artist',
							libraryId: artist?.artist?.library_id,
							colorPalette: JSON.parse(artist?.artist?.colorPalette ?? '{}'),
						};
					}
					return {
						...album?.album,
						artist: artist?.artist,
						type: 'album',
						libraryId: album?.album?.library_id,
						colorPalette: JSON.parse(album?.album?.colorPalette ?? '{}'),
					};
				}), 'id'))
				.slice(0, 14);

			if (x.length > 13) {
				genreItems.push({
					title: g.name,
					moreLink: `/music/genre/${g.id}`,
					items: x,
				});
			}
		});

	} catch (error) {
		console.log(error);
	}

	const response: HomeData[] = [
		{
			title: 'Your top mixes',
			moreLink: '',
			// items: shuffle(tracks)
			// 	.slice(0, 14)
			// 	.map(t => ({ ...t, libraryId: albums[0].libraryId, type: 'track' })),
			items: [],
		},
		{
			title: 'Recent',
			moreLink: '',
			items: [],
		},
		{
			title: 'Artists',
			moreLink: '/music/collection/artists',
			items: shuffle(artistItems)
				.slice(0, 14)
				.map((m) => {
					return {
						...m.artist,
						type: 'artist',
						name: m.artist.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.artist.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
						colorPalette: JSON.parse(m.artist.colorPalette ?? '{}'),
					};
				}),
		},
		{
			title: 'Albums',
			moreLink: '/music/collection/albums',
			items: shuffle(albumItems)
				.slice(0, 14)
				.map((m) => {
					return {
						...m.album,
						type: 'album',
						name: m.album.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.album.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
						colorPalette: JSON.parse(m.album.colorPalette ?? '{}'),
					};
				}),
		},
		{
			title: 'Playlists',
			moreLink: '/music/collection/playlists',
			items: playlistsItems.map((m) => {
				return {
					...m,
					type: 'playlist',
					name: m.name.replace(/["'\[\]*]/gu, ''),
					title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
					origin: deviceId,
					colorPalette: JSON.parse(m.colorPalette ?? '{}'),
				};
			}),
		},
		// ...genreItems.slice(0, 14),
		...genreItems,
	];

	// return res.json(response);
	return res.json(response.filter(d => d.items.length > 0));

}

export interface HomeData {
    title: string;
    moreLink: string;
    items: HomeDataItem[];
}

export interface HomeDataItem {
    id: string;
    name: string;
    description: null;
    cover: null | string;
    folder: string;
    colorPalette: null | string;
    blurHash: null | string;
    libraryId: string;
    trackId?: null;
    _count: Count;
    type: Type;
    title_sort?: string;
    origin?: string;
    country?: string | null;
    year?: number | null;
    tracks?: number;
    Artist?: Artist[];
    Album?: Album[];
}

export interface Count {
    track: number;
    Artist?: number;
    File?: number;
    Album?: number;
}

export enum Type {
    Album = 'album',
    Artist = 'artist',
    Genre = 'genre',
    Playlist = 'playlist',
}
