import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { keyword_movie } from '../schema/keyword_movie';

export type NewKeywordMovie = InferModel<typeof keyword_movie, 'insert'>;
export const insertKeywordMovie = (data: NewKeywordMovie) => globalThis.mediaDb.insert(keyword_movie)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [
			keyword_movie.movie_id,
			keyword_movie.keyword_id,
		],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type KeywordMovie = InferModel<typeof keyword_movie, 'select'>;
export const selectKeywordMovie = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.keyword_movie.findMany({
			with: {
				keyword: true,
				movie: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(keyword_movie)
		.all();
};
