import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { collections } from '../schema/collections';

export type NewCollection = InferModel<typeof collections, 'insert'>;
export const insertCollection = (data: NewCollection) => globalThis.mediaDb.insert(collections)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: collections.id,
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Collection = InferModel<typeof collections, 'select'>;
export const selectCollection = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.collections.findMany({
			with: {
				collection_movie: true,
				translations: true,
				library: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(collections)
		.all();
};
