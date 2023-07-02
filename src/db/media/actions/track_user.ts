import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { track_user } from '../schema/track_user';

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
