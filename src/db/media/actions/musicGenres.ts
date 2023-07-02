import { mediaDb } from '@/db/media';
import { musicGenres } from '../schema/musicGenres';
import { createId } from '@paralleldrive/cuid2';
import { InferModel } from 'drizzle-orm';

export type NewMusicGenre = InferModel<typeof musicGenres, 'insert'>;
export const insertMusicGenre = (data: NewMusicGenre) => {
	return mediaDb.insert(musicGenres)
		.values({
			...data,
			id: data.id ?? createId(),
		})
		.onConflictDoUpdate({
			target: musicGenres.name,
			set: {
				...data,
				id: data.id ?? undefined,
			},
		})
		.returning()
		.get();
};

export const selectMusicGenre = () => {
	return mediaDb.select()
		.from(musicGenres)
		.all();
};
