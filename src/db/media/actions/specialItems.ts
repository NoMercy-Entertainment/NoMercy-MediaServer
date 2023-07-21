import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { specialItems } from '../schema/specialItems';

export type NewSpecialItem = InferModel<typeof specialItems, 'insert'>;
export const insertSpecialItem = (data: NewSpecialItem, constraint: 'episode' | 'movie') => globalThis.mediaDb.insert(specialItems)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [
			specialItems.special_id,
			specialItems[`${constraint}_id`],
		],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type SpecialItem = InferModel<typeof specialItems, 'select'>;
export const selectSpecialItem = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.specialItems.findMany({
			with: {
				special: true,
				episode: true,
				movie: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(specialItems)
		.all();
};
