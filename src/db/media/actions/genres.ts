import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { genres } from '../schema/genres';

export type NewGenre = InferModel<typeof genres, 'insert'>;
export const insertGenre = (data: NewGenre) => mediaDb.insert(genres)
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
		return mediaDb.query.genres.findMany({
			with: {
				genre_movie: true,
				genre_tv: true,
				musicGenre_track: true,
			},
		});
	}
	return mediaDb.select()
		.from(genres)
		.all();
};
