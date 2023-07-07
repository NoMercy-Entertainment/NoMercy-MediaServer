
import { convertBooleans } from '../../helpers';
import { InferModel, or, like, eq, and, inArray } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { artists } from '../schema/artists';
import { Album } from './albums';
import { AlbumArtist } from './album_artist';
import { Library, getAllowedLibraries } from './libraries';
import { ArtistTrack } from './artist_track';
import { Track } from './tracks';
import { TrackUser } from './track_user';
import { User } from './users';
import { AlbumTrack } from './album_track';
import { LibraryUser } from './library_user';
import { artist_library } from '../schema/artist_library';
import { album_track } from '../schema/album_track';
import { artist_track } from '../schema/artist_track';
import { track_user } from '../schema/track_user';
import { album_artist } from '../schema/album_artist';

export type NewArtist = InferModel<typeof artists, 'insert'>;
export const insertArtist = (data: NewArtist) => mediaDb.insert(artists)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: artists.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Artist = InferModel<typeof artists, 'select'>;
export type ArtistsWithRelations = Artist & {
	album_artist: AlbumArtist & {
		album: Album;
	}[];
	library: (Library & {
		library_user?: LibraryUser[];
	});
};
export const selectArtists = (letter: string, user_id: string): ArtistsWithRelations[] => {

	const allowedLibraries = getAllowedLibraries(user_id);

	const result = mediaDb.query.artists.findMany({
		with: {
			// album_artist: {
			// 	with: {
			// 		album: true,
			// 	},
			// },
			library: {
				with: {
					library_user: true,
				},
			},
		},
		where: letter == '_'
			? and(
				or(
					like(artists.name, '*%'),
					like(artists.name, '#%'),
					like(artists.name, '\'%'),
					like(artists.name, '"%'),
					like(artists.name, '1%'),
					like(artists.name, '2%'),
					like(artists.name, '3%'),
					like(artists.name, '4%'),
					like(artists.name, '5%'),
					like(artists.name, '6%'),
					like(artists.name, '7%'),
					like(artists.name, '8%'),
					like(artists.name, '9%'),
					like(artists.name, '0%')
				),
				inArray(artist_library.library_id, allowedLibraries)
			)
			: and(
				like(artists.name, `${letter}%`),
				inArray(artist_library.library_id, allowedLibraries)
			),
		// orderBy: asc(artists.name),
	}) as unknown as ArtistsWithRelations[];

	return result.map(a => ({
		...a,
		library: {
			...a.library,
			library_user: undefined,
		},
	})).sort((a, b) => a.name.localeCompare(b.name));
};

export type ArtistWithRelations = Artist & {
	album_artist: (AlbumArtist & {
		album: Album;
	});
	artist_track: (ArtistTrack & {
		track: (Track & {
			album_track: (AlbumTrack & {
				album: Album;
			})[];
			artist_track: (ArtistTrack & {
				artist: Artist;
			})[];
			track_user: (TrackUser & {
				user: User;
			})[];
		});
	})[];
	library: (Library & {
		library_user?: LibraryUser[];
	});
};
export const selectArtist = (id: string, user_id: string) => {

	const allowedLibraries = getAllowedLibraries(user_id);

	const result = mediaDb.query.artists.findFirst({
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
		},
		where: and(
			eq(artists.id, id),
			inArray(artist_library.library_id, allowedLibraries)
		),
	}) as unknown as (Artist & {
		library: (Library & {
			library_user?: LibraryUser[];
		});
	});

	if (!result) {
		return null;
	}

	const artistTrackResult = mediaDb.query.artist_track.findMany({
		with: {
			track: true,
		},
		where: eq(artist_track.artist_id, result.id),
	}) as unknown as (ArtistTrack & {
		track: Track;
	})[];

	const albumArtistResult = mediaDb.query.album_artist.findFirst({
		with: {
			album: true,
		},
		where: inArray(album_artist.artist_id, artistTrackResult.map(t => t.artist_id)),
	}) as unknown as (AlbumArtist & {
		album: Album;
	});

	const albumTracksResult = mediaDb.query.album_track.findMany({
		with: {
			album: true,
		},
		where: inArray(album_track.track_id, artistTrackResult.map(t => t.track_id)),
	}) as unknown as (AlbumTrack & {
		album: Album;
	})[];

	const artistTracksResult = mediaDb.query.artist_track.findMany({
		with: {
			artist: true,
		},
		where: inArray(artist_track.track_id, artistTrackResult.map(t => t.track_id)),
	}) as unknown as (ArtistTrack & {
		artist: Artist;
	})[];

	const trackUserResult = mediaDb.query.track_user.findMany({
		where: and(
			inArray(track_user.track_id, artistTrackResult.map(t => t.track_id)),
			eq(track_user.user_id, user_id)
		),
	}) as unknown as TrackUser[];

	return {
		...result,
		album_artist: albumArtistResult,
		artist_track: artistTrackResult.map(t => ({
			...t,
			track: {
				...t.track,
				album_track: albumTracksResult.filter(a => a.track_id == t.track_id)!,
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

export const findArtist = (id: string) => mediaDb.select()
	.from(artists)
	.where(eq(artists.id, id))
	.get();
