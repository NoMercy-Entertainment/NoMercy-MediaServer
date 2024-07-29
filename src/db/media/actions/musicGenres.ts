import { musicGenres } from '../schema/musicGenres';
import { InferModel } from 'drizzle-orm';


export type MusicGenre = InferModel<typeof musicGenres, 'insert'>;

export type NewMusicGenre = InferModel<typeof musicGenres, 'select'>;
export const insertMusicGenre = (data: NewMusicGenre) => {
	return globalThis.mediaDb.insert(musicGenres)
		.values(data)
		.onConflictDoUpdate({
			target: [musicGenres.id],
			set: data,
		})
		.returning()
		.get();
};

export const selectMusicGenre = () => {
	return globalThis.mediaDb.select()
		.from(musicGenres)
		.all();
};
