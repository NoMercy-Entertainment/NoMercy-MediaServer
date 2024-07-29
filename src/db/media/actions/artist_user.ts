import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { track_user } from '../schema/track_user';
import { artist_user } from '../schema/artist_user';

export type NewTrackUser = InferModel<typeof track_user, 'insert'>;
export const insertTrackUser = (data: NewTrackUser) => globalThis.mediaDb.insert(track_user)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [artist_user.artist_id, track_user.user_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type TrackUser = InferModel<typeof track_user, 'select'>;
export const selectTrackUser = () => {
	return globalThis.mediaDb.select()
		.from(track_user)
		.all();
};
