import { Request, Response } from 'express';
import { shuffle, unique } from '../../../functions/stringArray';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';

export interface HomeData {
	title: string;
	moreLink: string;
	items: Item[];
}

export interface Item {
	id: string;
	name: string;
	track?: number;
	disc?: number;
	cover: null | string;
	date?: null | string;
	folder: string;
	filename?: string;
	duration?: string;
	quality?: number;
	path?: string;
	lyrics?: null | string;
	colorPalette: null | string;
	blurHash: null | string;
	MusicGenre?: MusicGenre[];
	libraryId: string;
	type: string;
	description?: null;
	trackId?: null;
	title_sort?: string;
	origin?: string;
	country?: string;
	year?: number;
	tracks?: number;
	Artist?: Artist[];
}

export interface Artist {
	id: string;
	name: string;
	description: null;
	cover: null | string;
	folder: string;
	colorPalette: null | string;
	blurHash: null | string;
	libraryId: string;
	trackId: null;
}

export interface MusicGenre {
	id: string;
	name: string;
}

export default async function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	const playlists = await confDb.playlist.findMany({
		where: {
			userId: user,
		},
		include: {
			_count: {
				select: {
					PlaylistTrack: true,
				},
			},
		},
		take: 12,
	});

	const userData = await confDb.userData.findMany({
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
	});

	const tracks = await confDb.track.findMany({
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
			},
			Album: {
				where: {
					NOT: {
						Track: {
							none: {},
						},
					},
				},
			},
		},
		// take: 12,
	});

	const albums = await confDb.album.findMany({
		include: {
			Artist: true,
		},
		// take: 12,

	});

	const artists = await confDb.artist.findMany({
		where: {
			NOT: {
				Track: {
					none: {},
				},
			},
		},
		// take: 12,

	});

	const genres = await confDb.musicGenre.findMany({
		orderBy: {
			Track: {
				_count: 'desc',
			},
		},
	});

	try {

		const genreItems = {};
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
						};
					}
					return {
						...d.Album[0],
						Artist: d.Artist,
						type: 'album',
						libraryId: d.Album[0].libraryId,
					};
				}), 'id')
				.sort(() => Math.random() - 0.5)
				.slice(0, 12);

			if (x.length > 7) {
				genreItems[g.name!] = {
					items: x,
					moreLink: `/music/genre/${g.id}`,
				};
			}
		});

		const response: HomeData[] = [
			// {
			// 	title: 'Your top mixes',
			// 	moreLink: '',
			// 	items: shuffle(tracks).slice(0,12).map(t => ({...t, libraryId: albums[0].libraryId, type: 'track'})),
			// },
			{
				title: 'Recent',
				moreLink: '',
				items: [],
			},
			{
				title: 'Artists',
				moreLink: '/music/collection/artists',
				items: shuffle(artists).slice(0, 12)
					.map((m) => {
						return {
							...m,
							type: 'artist',
							name: m.name.replace(/["'\[\]*]/gu, ''),
							title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
							origin: deviceId,
						};
					}),
			},
			{
				title: 'Albums',
				moreLink: '/music/collection/albums',
				items: shuffle(albums).slice(0, 12)
					.map((m) => {
						return {
							...m,
							type: 'album',
							name: m.name.replace(/["'\[\]*]/gu, ''),
							title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
							origin: deviceId,
						};
					}),
			},
			{
				title: 'Playlists',
				moreLink: '/music/collection/playlists',
				items: playlists,
			},
			...(Object.entries(genreItems ?? {})?.map(g => ({
				title: g[0] as string,
				moreLink: (g[1] as any).moreLink,
				items: (g[1] as any).items as any[],
			})) ?? []),
		].filter(l => l.items.length);

		return res.json(response);

	} catch (error) {
		console.log(error);
	}

}
