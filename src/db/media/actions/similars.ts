import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { similars } from '../schema/similars';

export type NewSimilar = InferModel<typeof similars, 'insert'>;
export const insertSimilar = (data: NewSimilar, constraint: 'movie' | 'tv') => globalThis.mediaDb.insert(similars)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [
			similars.media_id,
			similars[`${constraint}From_id`],
		],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Similar = InferModel<typeof similars, 'select'>;
export const selectSimilar = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.similars.findMany({
			with: {
				movie_from: true,
				movie_to: true,
				tv_from: true,
				tv_to: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(similars)
		.all();
};
