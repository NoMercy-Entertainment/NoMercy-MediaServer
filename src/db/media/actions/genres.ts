import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { genres } from '../schema/genres';

export type NewGenre = InferModel<typeof genres, 'insert'>;
export const insertGenre = (data: NewGenre) => globalThis.mediaDb.insert(genres)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: genres.id,
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Genre = InferModel<typeof genres, 'select'>;
export const selectGenre = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.genres.findMany({
			with: {
				genre_movie: true,
				genre_tv: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(genres)
		.all();
};
