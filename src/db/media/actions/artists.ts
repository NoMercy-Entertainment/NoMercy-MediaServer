
import { convertBooleans } from '../../helpers';
import { InferModel, or, like, asc, eq } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { artists } from '../schema/artists';
import { Album } from './albums';
import { AlbumArtist } from './album_artist';
import { Library } from './libraries';
import { track_user } from '../schema/track_user';
import { ArtistTrack } from './artist_track';
import { Track } from './tracks';
import { TrackUser } from './track_user';
import { User } from './users';
import { AlbumTrack } from './album_track';

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
	library: Library;
};
export const selectArtists = (letter: string): ArtistsWithRelations[] => {
	return mediaDb.query.artists.findMany({
		with: {
			album_artist: {
				with: {
					album: true,
				},
			},
			library: true,
		},
		where: letter == '_'
			? or(
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
			)
			: like(artists.name, `${letter}%`),
		orderBy: asc(artists.name),
	}) as unknown as ArtistsWithRelations[];
};

export type ArtistWithRelations = Artist & {
	album_artist: (AlbumArtist & {
		album: Album;
	})[];
	artist_track: (ArtistTrack & {
		track: Track & {
			album_track: AlbumTrack & {
				album: Album;
			}[];
			artist_track: ArtistTrack & {
				artist: Artist;
			}[];
			track_user: TrackUser & {
				user: User;
			}[];
		};
	})[];
	library: Library;
};
export const selectArtist = (id: string, user_id: string): ArtistWithRelations => {
	return mediaDb.query.artists.findFirst({
		with: {
			album_artist: {
				with: {
					album: true,
				},
			},
			artist_track: {
				with: {
					track: {
						with: {
							album_track: {
								with: {
									album: true,
								},
							},
							artist_track: {
								with: {
									artist: true,
								},
							},
							track_user: {
								where: eq(track_user.user_id, user_id),
							},
						},
					},
				},
			},
			library: true,
		},
		where: eq(artists.id, id),
	}) as unknown as ArtistWithRelations;
};

