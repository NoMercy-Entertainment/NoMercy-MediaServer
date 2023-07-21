import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { convertBooleans } from '@server/db/helpers';
import { playlist_track } from '../schema/playlist_track';

export type NewPlaylistTrack = InferModel<typeof playlist_track, 'insert'>;
export const insertPlaylistTrack = (data: NewPlaylistTrack) => mediaDb.insert(playlist_track)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [playlist_track.playlist_id, playlist_track.track_id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type PlaylistTrack = InferModel<typeof playlist_track, 'select'>;
export const selectPlaylistTrack = () => {
	return mediaDb.select()
		.from(playlist_track)
		.all();
};
