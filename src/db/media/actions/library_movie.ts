import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { library_movie } from '../schema/library_movie';

export type NewLibraryMovie = InferModel<typeof library_movie, 'insert'>;
export const insertLibraryMovie = (data: NewLibraryMovie) => globalThis.mediaDb.insert(library_movie)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [library_movie.library_id, library_movie.movie_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type LibraryMovie = InferModel<typeof library_movie, 'select'>;
export const selectLibraryMovie = () => {
	return globalThis.mediaDb.select()
		.from(library_movie)
		.all();
};
