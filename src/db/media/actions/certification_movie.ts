import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { certification_movie } from '../schema/certification_movie';

export type NewCertificationMovie = InferModel<typeof certification_movie, 'insert'>;
export const insertCertificationMovie = (data: NewCertificationMovie) => globalThis.mediaDb.insert(certification_movie)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [certification_movie.movie_id, certification_movie.certification_id, certification_movie.iso31661],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type CertificationMovie = InferModel<typeof certification_movie, 'select'>;
export const selectCertificationMovie = () => {
	return globalThis.mediaDb.select()
		.from(certification_movie)
		.get();
};
