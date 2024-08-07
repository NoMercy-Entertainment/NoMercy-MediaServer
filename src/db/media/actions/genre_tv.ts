import { InferModel } from 'drizzle-orm';

import { genre_tv } from '../schema/genre_tv';
import { convertBooleans } from '@server/db/helpers';

export type NewGenreTv = InferModel<typeof genre_tv, 'insert'>;
export const insertGenreTv = (data: NewGenreTv) => globalThis.mediaDb.insert(genre_tv)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [genre_tv.tv_id, genre_tv.genre_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type GenreTv = InferModel<typeof genre_tv, 'select'>;
export const selectGenreTv = () => {
	return globalThis.mediaDb.select()
		.from(genre_tv)
		.get();
};
