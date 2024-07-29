import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { playlist_track } from '../schema/playlist_track';

export type NewPlaylistTrack = InferModel<typeof playlist_track, 'insert'>;
export const insertPlaylistTrack = (data: NewPlaylistTrack) => globalThis.mediaDb.insert(playlist_track)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [playlist_track.playlist_id, playlist_track.track_id],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type PlaylistTrack = InferModel<typeof playlist_track, 'select'>;
export const selectPlaylistTrack = () => {
	return globalThis.mediaDb.select()
		.from(playlist_track)
		.all();
};
