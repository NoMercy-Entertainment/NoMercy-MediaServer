import { InferModel, eq, inArray } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { track_user } from '../schema/track_user';
import { album_track } from '../schema/album_track';
import { artist_track } from '../schema/artist_track';
import { AlbumTrack } from './album_track';
import { Album } from './albums';
import { ArtistTrack } from './artist_track';
import { Artist } from './artists';
import { Track } from './tracks';

export type NewTrackUser = InferModel<typeof track_user, 'insert'>;
export const insertTrackUser = (data: NewTrackUser) => mediaDb.insert(track_user)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [track_user.track_id, track_user.user_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type TrackUser = InferModel<typeof track_user, 'select'>;
export const selectTrackUser = () => {
	return mediaDb.select()
		.from(track_user)
		.all();
};


export const selectFavoriteTracks = (user_id: string) => {

	const result = mediaDb.query.track_user.findMany({
		with: {
			track: {
				with: {
					track_user: {
						where: eq(track_user.user_id, user_id),
					},
				},
			},
		},
		where: eq(track_user.user_id, user_id),
	}) as unknown as (TrackUser & {
		track: (Track &{
			track_user: TrackUser[];
		});
	})[];

	const artistTrackResults = mediaDb.query.artist_track.findMany({
		where: inArray(artist_track.track_id, result.map(m => m.track_id)),
		with: {
			artist: true,
		},
	}) as unknown as (ArtistTrack & {
		artist: Artist;
	})[];

	const albumTrackResults = mediaDb.query.album_track.findMany({
		where: inArray(album_track.track_id, result.map(m => m.track_id)),
		with: {
			album: true,
		},
	}) as unknown as (AlbumTrack & {
		album: Album;
	})[];

	if (!result) {
		return null;
	}

	return result.map(m => ({
		...m,
		track: {
			...m.track,
			artist: artistTrackResults
				.filter(a => a.artist_id != '89ad4ac3-39f7-470e-963a-56509c546377')
				.filter(a => a.track_id == m.track_id)
				.map(a => a.artist),
			album: albumTrackResults
				.filter(a => a.track_id == m.track_id)
				.map(a => a.album),
		},
	})) as unknown as (TrackUser & {
		track: (Track & {
			artist: Artist[];
			album: Album[];
		});
	})[];
};
