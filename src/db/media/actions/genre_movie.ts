import { mediaDb } from '@server/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { genre_movie } from '../schema/genre_movie';

export type NewGenreMovie = InferModel<typeof genre_movie, 'insert'>;
export const insertGenreMovie = (data: NewGenreMovie) => mediaDb.insert(genre_movie)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [genre_movie.movie_id, genre_movie.genre_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type GenreMovie = InferModel<typeof genre_movie, 'select'>;
export const selectGenreMovie = () => {
	return mediaDb.select()
		.from(genre_movie)
		.get();
};
