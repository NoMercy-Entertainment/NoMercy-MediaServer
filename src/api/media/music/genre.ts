import { Request, Response } from 'express';

import { mediaDb } from '@server/db/media';
import { asc, eq, inArray } from 'drizzle-orm';
import { musicGenre_track } from '@server/db/media/schema/musicGenre_track';
import { track_user } from '@server/db/media/schema/track_user';
import { musicGenres } from '@server/db/media/schema/musicGenres';
import { PaletteColors } from '@server/types/server';
import { Country } from '@server/db/media/actions/countries';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { deviceId } from '@server/functions/system';
import { album_track } from '@server/db/media/schema/album_track';
import { artist_track } from '@server/db/media/schema/artist_track';

export default function (req: Request, res: Response) {

	const music = mediaDb.query.musicGenres.findFirst({
		where: eq(musicGenres.id, req.params.id),
		// track: {
		// 	some: {
		// 		id: {
		// 			not: undefined,
		// 		},
		// 	},
		// },
		with: {
			musicGenre_track: {
				orderBy: asc(musicGenre_track.musicGenre_id),
				with: {
					track: {
						with: {
							track_user: {
								where: eq(track_user.user_id, req.user.sub),
							},
						},
					},
				},
			},
		},
	});

	const albumResult = mediaDb.query.album_track.findMany({
		where: inArray(album_track.track_id, music?.musicGenre_track.map(t => t.track.id) ?? []),
		with: {
			album: true,
		},
	});

	const artistResult = mediaDb.query.artist_track.findMany({
		where: inArray(artist_track.track_id, music?.musicGenre_track.map(t => t.track.id) ?? []),
		with: {
			artist: true,
		},
	});

	if (!music) {
		return res.json({
			status: 'error',
			message: 'Nothing found for this genre',
		});
	}

	const result = {
		...music,
		type: 'genre',
		name: music.name?.replace(/["'\[\]*]/gu, '') ?? '',
		titleSort: createTitleSort(music.name?.replace(/["'\[\]*]/gu, '') ?? ''),
		origin: deviceId,
		track: music.musicGenre_track.map((t) => {

			const artists = artistResult.filter(a => a.track_id == t.track_id).map(a => ({
				id: a?.artist?.id,
				name: a?.artist?.name,
				cover: a?.artist?.cover ?? null,
				description: a?.artist?.description,
				folder: a?.artist?.folder,
				libraryId: a?.artist?.library_id,
				origin: deviceId,
				colorPalette: a?.artist?.colorPalette,
			}));
			const albums = albumResult.filter(a => a.track_id == t.track_id).map(a => ({
				id: a?.album?.id,
				name: a?.album?.name,
				folder: a?.album?.folder,
				cover: a?.album?.cover ?? null,
				description: a?.album?.description,
				libraryId: a?.album?.library_id,
				origin: deviceId,
				colorPalette: a?.album?.colorPalette,
			}));

			return {
				...t.track,
				date: t.track.date,
				lyrics: undefined,
				type: 'album',
				favorite_track: t.track.track_user.length > 0,
				artistId: artists[0]?.id,
				origin: deviceId,
				cover: (albums[0] ?? t).cover,
				libraryId: t.track.folder_id,
				colorPalette: JSON.parse((albums[0] ?? t).colorPalette ?? '{}'),
				FavoriteTrack: undefined,
				album_track: albums,
				album: albums[0],
				artist: artists[0],
				artist_track: artists,
			};
		}),
	};

	return res.json(result);
}

export interface GenreResponse {
    id: string | null;
    name: string;
    type: string;
    titleSort: string;
    origin: string;
    track: track[];
}

export interface track {
    id: string;
    name: string;
    track: number | null;
    disc: number | null;
    cover: string | null;
    date: string | null;
    folder: string | null;
    filename: string;
    duration: string | null;
    quality: number | null;
    path: string;
    colorPalette: PaletteColors | null;
    blurHash: string | null;
    Album: Album[];
    Artist: Artist[];
    type: string;
    favorite_track: boolean;
    artistId: string;
    origin: string;
    libraryId: string;
}

export interface Album {
    id: string;
    name: string;
    description: string | null;
    folder: string | null;
    cover: string | null;
    country: Country;
    year: number | null;
    tracks: number | null;
    colorPalette: string | null;
    blurHash: string | null;
    libraryId: string;
}

export interface Artist {
    id: string;
    name: string;
    cover: string | null;
    description: string | null;
    folder: string | null;
    libraryId: string;
    origin: string;
    colorPalette: string | null;
}
