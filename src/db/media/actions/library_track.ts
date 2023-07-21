
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { library_track } from '../schema/library_track';

export type NewLibraryTrack = InferModel<typeof library_track, 'insert'>;
export const insertLibraryTrack = (data: NewLibraryTrack) => mediaDb.insert(library_track)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [library_track.library_id, library_track.track_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type LibraryTrack = InferModel<typeof library_track, 'select'>;
export const selectLibraryTrack = () => {
	return mediaDb.select()
		.from(library_track)
		.all();
};
