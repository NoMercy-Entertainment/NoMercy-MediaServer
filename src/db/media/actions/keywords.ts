import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { keywords } from '../schema/keywords';

export type NewKeyword = InferModel<typeof keywords, 'insert'>;
export const insertKeyword = (data: NewKeyword) => globalThis.mediaDb.insert(keywords)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: keywords.id,
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Keyword = InferModel<typeof keywords, 'select'>;
export const selectKeyword = () => {
	return globalThis.mediaDb.select()
		.from(keywords)
		.all();
};
