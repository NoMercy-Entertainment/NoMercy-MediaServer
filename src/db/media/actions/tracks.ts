import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { tracks } from '../schema/tracks';

export type NewTrack = InferModel<typeof tracks, 'insert'>;
export const insertTrack = (data: NewTrack) => globalThis.mediaDb.insert(tracks)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [tracks.id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Track = InferModel<typeof tracks, 'select'>;
export const selectTrack = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.tracks.findMany({
			with: {
				album_track: true,
				artist_track: true,
				musicGenre_track: true,
				playlist_track: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(tracks)
		.all();
};
