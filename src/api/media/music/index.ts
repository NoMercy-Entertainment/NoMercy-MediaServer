import { Album, Artist, MusicGenre, Playlist, Prisma, Track, UserData } from '../../../database/config/client';
import { Request, Response } from 'express';
import { shuffle, unique } from '../../../functions/stringArray';

import { HomeData } from './index.d';
import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';

export default async function (req: Request, res: Response): Promise<Response<HomeData[]>> {

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const playlists: (Playlist & {
		_count: Prisma.PlaylistCountOutputType;
	})[] = [];
	const userData: UserData[] = [];
	const tracks: (Track & {
		Artist: (Artist & {
			_count: Prisma.ArtistCountOutputType;
		})[];
		Album: (Album & {
			_count: Prisma.AlbumCountOutputType;
		})[];
		MusicGenre: MusicGenre[];
		_count: Prisma.TrackCountOutputType;
	})[] = [];
	const albums: Album[] = [];
	const artists: (Artist & {
		_count: Prisma.ArtistCountOutputType;
	})[] = [];

	const genres: MusicGenre[] = [];

	await Promise.all([
		confDb.playlist.findMany({
			where: {
				userId: user,
			},
			include: {
				_count: true,
			},
			take: 12,
		}).then(d => playlists.push(...d)),

		confDb.userData.findMany({
			where: {
				sub_id: user,
				NOT: {
					isFavorite: null,
				},
			},
			take: 12,
			orderBy: {
				updatedAt: 'desc',
			},
		}).then(d => userData.push(...d)),

		confDb.track.findMany({
			where: {
				cover: {
					not: null,
				},
			},
			include: {
				MusicGenre: true,
				Artist: {
					where: {
						NOT: {
							Track: {
								none: {},
							},
						},
					},
					include: {
						_count: true,
					},
				},
				Album: {
					where: {
						NOT: {
							Track: {
								none: {},
							},
						},
					},
					include: {
						_count: true,
					},
				},
				_count: true,
			},
			// take: 12,
		}).then(d => tracks.push(...d)),

		confDb.album.findMany({
			include: {
				Artist: true,
				_count: true,
			},
			// take: 12,

		}).then(d => albums.push(...d)),

		confDb.artist.findMany({
			where: {
				NOT: {
					Track: {
						none: {},
					},
				},
			},
			include: {
				_count: true,
			},
			// take: 12,

		}).then(d => artists.push(...d)),

		confDb.musicGenre.findMany({
			orderBy: {
				Track: {
					_count: 'desc',
				},
			},
		}).then(d => genres.push(...d)),
	]);

	const genreItems: any[] = [];

	try {

		genres.map((g) => {
			const x = unique(tracks
				.filter(d => d.MusicGenre && d.MusicGenre.map(g => g.id).includes(g.id))
				.map((d, index) => {
					if (index % 2 == 0) {
						return {
							...d.Artist[0],
							Album: d.Album,
							type: 'artist',
							libraryId: d.Artist[0].libraryId,
							colorPalette: JSON.parse(d.Artist[0].colorPalette ?? '{}'),
						};
					}
					return {
						...d.Album[0],
						Artist: d.Artist,
						type: 'album',
						libraryId: d.Album[0].libraryId,
						colorPalette: JSON.parse(d.Album[0].colorPalette ?? '{}'),
					};
				}), 'id')
				.filter((g: any) => {
					if (g.type == 'album') return true;
					if (g._count.Track > 10) return true;
					return false;
				})
				.sort(() => Math.random() - 0.5)
				.slice(0, 12);

			if (x.length > 7) {
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
			// 	.slice(0, 12)
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
			items: shuffle(artists
				.filter((m: any) => m._count.Track > 10))
				.slice(0, 12)
				.map((m) => {
					return {
						...m,
						type: 'artist',
						name: m.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
						colorPalette: JSON.parse(m.colorPalette ?? '{}'),
					};
				}),
		},
		{
			title: 'Albums',
			moreLink: '/music/collection/albums',
			items: shuffle(albums)
				.slice(0, 12)
				.map((m) => {
					return {
						...m,
						type: 'album',
						name: m.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
						colorPalette: JSON.parse(m.colorPalette ?? '{}'),
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
					colorPalette: JSON.parse(m.colorPalette ?? '{}'),
				};
			}),
		},
		...genreItems.slice(0, 12),
	];

	return res.json(response);

}
