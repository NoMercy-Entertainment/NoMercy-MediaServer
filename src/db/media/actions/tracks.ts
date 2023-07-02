import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { tracks } from '../schema/tracks';

export type NewTrack = InferModel<typeof tracks, 'insert'>;
export const insertTrack = (data: NewTrack) => mediaDb.insert(tracks)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [tracks.filename, tracks.path],
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
		return mediaDb.query.tracks.findMany({
			with: {
				album_track: true,
				artist_track: true,
				musicGenre_track: true,
				playlist_track: true,
			},
		});
	}
	return mediaDb.select()
		.from(tracks)
		.all();
};
