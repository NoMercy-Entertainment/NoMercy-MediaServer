
import { convertBooleans } from '../../helpers';
import { InferModel, asc, eq, like, or } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { albums } from '../schema/albums';
import { AlbumArtist } from './album_artist';
import { Library } from './libraries';
import { Artist } from './artists';
import { AlbumTrack } from './album_track';
import { Track } from './tracks';
import { TrackUser } from './track_user';
import { User } from './users';
import { track_user } from '../schema/track_user';

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
	library: Library;
};
export const selectAlbums = (letter: string): AlbumsWithRelations[] => {
	return mediaDb.query.albums.findMany({
		with: {
			album_artist: true,
			album_track: true,
			library: true,
		},
		where: letter == '_'
			? or(
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
			)
			: like(albums.name, `${letter}%`),
		orderBy: asc(albums.name),
	}) as unknown as AlbumsWithRelations[];
};
export type AlbumWithRelations = Album & {
	album_artist: (AlbumArtist & {
		artist: Artist;
	})[];
	album_track: (AlbumTrack & {
		track: Track & {
			album_track: AlbumTrack & {
				album: Album;
			}[];
			artist_track: Artist & {
				artist: Artist;
			}[];
			track_user: TrackUser & {
				user: User;
			}[];
		};
	})[];
	library: Library;
};
export const selectAlbum = (id: string, user_id: string): AlbumWithRelations => {
	return mediaDb.query.albums.findFirst({
		with: {
			album_artist: {
				with: {
					artist: true,
				},
			},
			album_track: {
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
		},
		where: eq(albums.id, id),
	}) as unknown as AlbumWithRelations;
};


// const music = await confDb.album.findFirst({
// 	where: {
// 		id: req.params.id,
// 	},
// 	include: {
// 		_count: true,
// 		Track: {
// 			distinct: ['name'],
// 			include: {
// 				Artist: true,
// 				Album: true,
// 				FavoriteTrack: {
// 					where: {
// 						userId: user,
// 					},
// 				},
// 			},
// 		},
// 		Artist: true,
// 	},
// });
