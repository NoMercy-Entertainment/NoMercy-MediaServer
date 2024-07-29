import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { recommendations } from '../schema/recommendations';

export type NewRecommendation = InferModel<typeof recommendations, 'insert'>;
export const insertRecommendation = (data: NewRecommendation, constraint: 'movie' | 'tv') => globalThis.mediaDb.insert(recommendations)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [
			recommendations.media_id,
			recommendations[`${constraint}From_id`],
		],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Recommendation = InferModel<typeof recommendations, 'select'>;
export const selectRecommendation = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.recommendations.findMany({
			with: {
				movie_from: true,
				movie_to: true,
				tv_from: true,
				tv_to: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(recommendations)
		.all();
};
