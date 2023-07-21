
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { album_track } from '../schema/album_track';

export type NewAlbumTrack = InferModel<typeof album_track, 'insert'>;
export const insertAlbumTrack = (data: NewAlbumTrack) => globalThis.mediaDb.insert(album_track)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [album_track.album_id, album_track.track_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type AlbumTrack = InferModel<typeof album_track, 'select'>;
export const selectAlbumTrack = () => {
	return globalThis.mediaDb.select()
		.from(album_track)
		.all();
};
