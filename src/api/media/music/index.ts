import { Request, Response } from 'express';
import { shuffle, unique } from '../../../functions/stringArray';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';

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
            }
        },
		take: 12,
        orderBy: {
            updatedAt: 'desc',
        }
    });

	const tracks = await confDb.track.findMany({
		where: {
			cover: {
				not: null,
			}
		},
		include: {
			MusicGenre: true,
		}
		// take: 12,
	});

	const albums = await confDb.album.findMany({
		include: {
			Artist: true,
		}
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
				_count: 'desc'
			}
		}
	});

	try {
		
		const genreItems = {};
		genres.map((g) => {
			const x = unique(tracks
				.filter(d => d.MusicGenre && d.MusicGenre.map(g => g.id).includes(g.id))
				.map((d) => {
					return {
						...d,
						type: 'track',
						libraryId: albums[0].libraryId,
					};
				}), 'folder')
				.sort(() => Math.random() - 0.5)
				.slice(0, 12);
	
			if (x.length > 7) {
				genreItems
				[g.name!] = {
					items: x,
					moreLink: `/music/genre/${g.id}`,
				};
			}
		});
	
		return res.json({
			top: {
				moreLink: '',
				items: shuffle(tracks).slice(0,12).map(t => ({...t, libraryId: albums[0].libraryId, type: 'track'})),
			},
			recent: {
				moreLink: '',
				items: [],
			},
			artists: {
				moreLink: '/music/collection/artists',
				items: shuffle(artists).slice(0, 12).map((m) => {
					return {
						...m,
						type: 'artist',
						name: m.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
					};
				}),
			},
			albums: {
				moreLink: '/music/collection/albums',
				items: shuffle(albums).slice(0, 12).map((m) => {
					return {
						...m,
						type: 'album',
						name: m.name.replace(/["'\[\]*]/gu, ''),
						title_sort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
						origin: deviceId,
					};
				}),
			},
			playlists: {
				moreLink: '/music/collection/playlists',
				items: playlists,
			},
			genres: genreItems,
		});
	} catch (error) {
		console.log(error)
	}

}
