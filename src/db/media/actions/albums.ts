import { and, asc, eq, inArray, InferModel, like, or } from 'drizzle-orm';

import { album_artist } from '../schema/album_artist';
import { album_library } from '../schema/album_library';
import { album_track } from '../schema/album_track';
import { albums } from '../schema/albums';
import { artist_track } from '../schema/artist_track';
import { convertBooleans } from '../../helpers';
import { getAllowedLibraries } from './libraries';
import { track_user } from '../schema/track_user';
import { album_user } from '../schema/album_user';

export type NewAlbum = InferModel<typeof albums, 'insert'>;
export const insertAlbum = (data: NewAlbum) => globalThis.mediaDb.insert(albums)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [albums.id],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Album = InferModel<typeof albums, 'select'>;

export type AlbumsWithRelations = ReturnType<typeof selectAlbums>;
export const selectAlbums = (letter: string, user_id: string) => {

	const allowedLibraries = getAllowedLibraries(user_id);

	if (allowedLibraries.length == 0) {
		return [];
	}

	const result = globalThis.mediaDb.query.albums.findMany({
		with: {
			album_track: {
				columns: {
					track_id: true,
				},
			},
			library: {
				with: {
					library_user: true,
				},
			},
		},
		orderBy: asc(albums.name),
		where: letter == '_'
			?			and(
				or(
					like(albums.name, '*%'),
					like(albums.name, '#%'),
					like(albums.name, '\'%'),
					like(albums.name, '"%'),
					like(albums.name, '1%'),
					like(albums.name, '2%'),
					like(albums.name, '3%'),
					like(albums.name, '4%'),
					like(albums.name, '5%'),
					like(albums.name, '6%'),
					like(albums.name, '7%'),
					like(albums.name, '8%'),
					like(albums.name, '9%'),
					like(albums.name, '0%')
				),
				inArray(album_library.library_id, allowedLibraries)
			)
			:			and(
				like(albums.name, `${letter}%`),
				inArray(album_library.library_id, allowedLibraries)
			),
	});

	return result.map(a => ({
		...a,
		library: {
			...a.library,
			library_user: undefined,
		},
	}));
};

export type AlbumWithRelations = ReturnType<typeof selectAlbum>;
export const selectAlbum = (id: string, user_id: string) => {
	const allowedLibraries = getAllowedLibraries(user_id);

	if (allowedLibraries.length == 0) {
		return null;
	}

	const result = globalThis.mediaDb.query.albums.findFirst({
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
			album_user: {
				where: eq(album_user.user_id, user_id),
			},
		},
		where: and(
			eq(albums.id, id),
			inArray(album_library.library_id, allowedLibraries)
		),
	});

	if (!result) {
		return null;
	}

	const albumArtistsResult = globalThis.mediaDb.query.album_artist.findMany({
		with: {
			artist: true,
		},
		where: eq(album_artist.album_id, result.id),
	});

	const albumTrackResult = globalThis.mediaDb.query.album_track.findMany({
		with: {
			track: true,
		},
		where: eq(album_track.album_id, result.id),
	});

	const artistTracksResult = albumTrackResult.length > 0
		?		globalThis.mediaDb.query.artist_track.findMany({
			with: {
				artist: true,
			},
			where: inArray(artist_track.track_id, albumTrackResult.map(t => t.track_id)),
		})
		:		[];

	const trackUserResult = globalThis.mediaDb.query.track_user.findMany({
		where: and(
			inArray(track_user.track_id, albumTrackResult.map(t => t.track_id)),
			eq(track_user.user_id, user_id)
		),
	});

	return {
		...result,
		album_artist: albumArtistsResult,
		album_track: albumTrackResult.map(t => ({
			...t,
			track: {
				...t.track,
				artist_track: artistTracksResult.filter(a => a.track_id == t.track_id)!,
				track_user: trackUserResult.filter(a => a.track_id == t.track_id)!,
			},
		})),
		library: {
			...result.library,
			library_user: undefined,
		},

	};
};

export const findAlbum = (id: string) => globalThis.mediaDb.select()
	.from(albums)
	.where(eq(albums.id, id))
	.get();
