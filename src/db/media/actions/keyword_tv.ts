import { mediaDb } from '@/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { keyword_tv } from '../schema/keyword_tv';

export type NewKeywordTv = InferModel<typeof keyword_tv, 'insert'>;
export const insertKeywordTv = (data: NewKeywordTv) => mediaDb.insert(keyword_tv)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [
			keyword_tv.tv_id,
			keyword_tv.keyword_id,
		],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type KeywordTv = InferModel<typeof keyword_tv, 'select'>;
export const selectKeywordTv = (relations = false) => {
	if (relations) {
		return mediaDb.query.keyword_tv.findMany({
			with: {
				keyword: true,
				tv: true,
			},
		});
	}
	return mediaDb.select()
		.from(keyword_tv)
		.all();
};
