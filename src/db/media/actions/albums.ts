
import { convertBooleans } from '../../helpers';
import { InferModel, and, eq, inArray, like, or } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { albums } from '../schema/albums';
import { AlbumArtist } from './album_artist';
import { Library, getAllowedLibraries } from './libraries';
import { Artist } from './artists';
import { AlbumTrack } from './album_track';
import { Track } from './tracks';
import { TrackUser } from './track_user';
import { User } from './users';
import { track_user } from '../schema/track_user';
import { LibraryUser } from './library_user';
import { album_library } from '../schema/album_library';
import { album_artist } from '../schema/album_artist';
import { artist_track } from '../schema/artist_track';
import { ArtistTrack } from './artist_track';
import { album_track } from '../schema/album_track';

export type NewAlbum = InferModel<typeof albums, 'insert'>;
export const insertAlbum = (data: NewAlbum) => mediaDb.insert(albums)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: albums.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Album = InferModel<typeof albums, 'select'>;
export type AlbumsWithRelations = Album & {
	album_artist: AlbumArtist[];
	album_track: AlbumTrack[];
	library: (Library & {
		library_user?: LibraryUser[];
	});
};
export const selectAlbums = (letter: string, user_id: string) => {

	const allowedLibraries = getAllowedLibraries(user_id);

	const result = mediaDb.query.albums.findMany({
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
		},
		where: letter == '_'
			? and(
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
			: and(
				like(albums.name, `${letter}%`),
				inArray(album_library.library_id, allowedLibraries)
			),
	}) as unknown as AlbumsWithRelations[];

	return result.map(a => ({
		...a,
		library: {
			...a.library,
			library_user: undefined,
		},
	})).sort((a, b) => a.name.localeCompare(b.name));
};
export type AlbumWithRelations = Album & {
	album_artist: (AlbumArtist & {
		artist: Artist;
	})[];
	library: (Library & {
		library_user?: LibraryUser[];
	});
	album_track: (AlbumTrack & {
		track: (Track & {
			album_track: (AlbumTrack & {
				track: Track;
			})[];
			artist_track: (ArtistTrack & {
				artist: Artist;
			})[];
			track_user: (TrackUser & {
				user: User;
			})[];
		});
	})[];
};
export const selectAlbum = (id: string, user_id: string) => {
	const allowedLibraries = getAllowedLibraries(user_id);

	const result = mediaDb.query.albums.findFirst({
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
		},
		where: and(
			eq(albums.id, id),
			inArray(album_library.library_id, allowedLibraries)
		),
	}) as unknown as (Album & {
		library: (Library & {
			library_user?: LibraryUser[];
		});
	}) | null;

	if (!result) {
		return null;
	}

	const albumArtistsResult = mediaDb.query.album_artist.findMany({
		with: {
			artist: true,
		},
		where: eq(album_artist.album_id, result.id),
	}) as unknown as (AlbumArtist & {
		artist: Artist;
	})[];

	const albumTrackResult = mediaDb.query.album_track.findMany({
		with: {
			track: true,
		},
		where: eq(album_track.album_id, result.id),
	}) as unknown as (AlbumTrack & {
		track: Track;
	})[];

	const artistTracksResult = mediaDb.query.artist_track.findMany({
		with: {
			artist: true,
		},
		where: inArray(artist_track.track_id, albumTrackResult.map(t => t.track_id)),
	}) as unknown as (ArtistTrack & {
		artist: Artist;
	})[];

	const trackUserResult = mediaDb.query.track_user.findMany({
		where: and(
			inArray(track_user.track_id, albumTrackResult.map(t => t.track_id)),
			eq(track_user.user_id, user_id)
		),
	}) as unknown as TrackUser[];

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

export const findAlbum = (id: string) => mediaDb.select()
	.from(albums)
	.where(eq(albums.id, id))
	.get();
