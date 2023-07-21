import { mediaDb } from '@server/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { collection_movie } from '../schema/collection_movie';

export type NewCollectionMovie = InferModel<typeof collection_movie, 'insert'>;
export const insertCollectionMovie = (data: NewCollectionMovie) => mediaDb.insert(collection_movie)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [collection_movie.movie_id, collection_movie.collection_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type CollectionMovie = InferModel<typeof collection_movie, 'select'>;
export const selectCollectionMovie = () => {
	return mediaDb.select()
		.from(collection_movie)
		.get();
};
