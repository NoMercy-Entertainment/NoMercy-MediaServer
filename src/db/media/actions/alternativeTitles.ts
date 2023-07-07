
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { alternativeTitles } from '../schema/alternativeTitles';

export type NewAlternativeTitle = InferModel<typeof alternativeTitles, 'insert'>;
export const insertAlternativeTitle = (data: NewAlternativeTitle, constraint: 'movie' | 'tv') => mediaDb.insert(alternativeTitles)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [
			alternativeTitles.iso31661,
			alternativeTitles[`${constraint}_id`],
		],
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
		},
	})
	.returning()
	.get();

export type AlternativeTitle = InferModel<typeof alternativeTitles, 'select'>;
export const selectAlternativeTitle = (relations = false) => {
	if (relations) {
		return mediaDb.query.posts.findMany({
			with: {
				movie: true,
				tv: true,
			},
		});
	}
	return mediaDb.select()
		.from(alternativeTitles)
		.all();
};