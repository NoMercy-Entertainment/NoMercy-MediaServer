
import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { album_musicGenre } from '../schema/album_musicGenre';

export type NewAlbumMusicGenre = InferModel<typeof album_musicGenre, 'insert'>;
export const insertAlbumMusicGenre = (data: NewAlbumMusicGenre) => globalThis.mediaDb.insert(album_musicGenre)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [album_musicGenre.album_id, album_musicGenre.musicGenre_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type AlbumMusicGenre = InferModel<typeof album_musicGenre, 'select'>;
export const selectAlbumMusicGenre = () => {
	return globalThis.mediaDb.select()
		.from(album_musicGenre)
		.get();
};
