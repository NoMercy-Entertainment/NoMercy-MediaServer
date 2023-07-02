import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { guestStars } from '../schema/guestStars';

export type NewGuestStar = InferModel<typeof guestStars, 'insert'>;
export const insertGuestStar = (data: NewGuestStar) => mediaDb.insert(guestStars)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [
			guestStars.id,
			// guestStars.person_id,
			// guestStars.episode_id,
		],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type GuestStar = InferModel<typeof guestStars, 'select'>;
export const selectGuestStar = (relations = false) => {
	if (relations) {
		return mediaDb.query.guestStars.findMany({
			with: {
				person: true,
				episode: true,
			},
		});
	}
	return mediaDb.select()
		.from(guestStars)
		.all();
};
