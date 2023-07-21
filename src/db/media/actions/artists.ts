
import { convertBooleans } from '../../helpers';
import { InferModel, or, like, eq, and, inArray } from 'drizzle-orm';
import { artists } from '../schema/artists';
import { getAllowedLibraries } from './libraries';
import { artist_library } from '../schema/artist_library';
import { album_track } from '../schema/album_track';
import { artist_track } from '../schema/artist_track';
import { album_artist } from '../schema/album_artist';

export type NewArtist = InferModel<typeof artists, 'insert'>;
export const insertArtist = (data: NewArtist) => globalThis.mediaDb.insert(artists)
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

export type ArtistsWithRelations = ReturnType<typeof selectArtists>;
export const selectArtists = (letter: string, user_id: string) => {

	const allowedLibraries = getAllowedLibraries(user_id);

	const result = globalThis.mediaDb.query.artists.findMany({
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
	});

	return result.map(a => ({
		...a,
		library: {
			...a.library,
			library_user: undefined,
		},
	})).sort((a, b) => a.name.localeCompare(b.name));
};

export type ArtistWithRelations = ReturnType<typeof selectArtist>;
export const selectArtist = (id: string, user_id: string) => {

	const allowedLibraries = getAllowedLibraries(user_id);

	const result = globalThis.mediaDb.query.artists.findFirst({
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
		},
		where: (artists, { eq, and }) => and(
			eq(artists.id, id),
			inArray(artist_library.library_id, allowedLibraries)
		),
	});

	if (!result) {
		return null;
	}

	const artistTrackResult = globalThis.mediaDb.query.artist_track.findMany({
		with: {
			track: true,
		},
		where: (artist_track, { eq }) => eq(artist_track.artist_id, result.id),
	});

	const albumArtistResult = globalThis.mediaDb.query.album_artist.findFirst({
		with: {
			album: true,
		},
		where: inArray(album_artist.artist_id, artistTrackResult.map(t => t.artist_id)),
	});

	const albumTracksResult = globalThis.mediaDb.query.album_track.findMany({
		with: {
			album: true,
		},
		where: inArray(album_track.track_id, artistTrackResult.map(t => t.track_id)),
	});

	const artistTracksResult = globalThis.mediaDb.query.artist_track.findMany({
		with: {
			artist: true,
		},
		where: inArray(artist_track.track_id, artistTrackResult.map(t => t.track_id)),
	});

	const trackUserResult = globalThis.mediaDb.query.track_user.findMany({
		where: (track_user, { eq, and }) => and(
			inArray(track_user.track_id, artistTrackResult.map(t => t.track_id)),
			eq(track_user.user_id, user_id)
		),
	});

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

export type Artist = InferModel<typeof artists, 'select'>;
export const findArtist = (id: string) => globalThis.mediaDb.select()
	.from(artists)
	.where(eq(artists.id, id))
	.get();
