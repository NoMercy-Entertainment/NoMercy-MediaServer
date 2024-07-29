import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { guestStars } from '../schema/guestStars';

export type NewGuestStar = InferModel<typeof guestStars, 'insert'>;
export const insertGuestStar = (data: NewGuestStar) => globalThis.mediaDb.insert(guestStars)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [
			guestStars.id,
			// guestStars.person_id,
			// guestStars.episode_id,
		],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type GuestStar = InferModel<typeof guestStars, 'select'>;
export const selectGuestStar = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.guestStars.findMany({
			with: {
				person: true,
				episode: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(guestStars)
		.all();
};
