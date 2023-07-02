
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { album_library } from '../schema/album_library';

export type NewAlbumLibrary = InferModel<typeof album_library, 'insert'>;
export const insertAlbumLibrary = (data: NewAlbumLibrary) => mediaDb.insert(album_library)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [album_library.album_id, album_library.library_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type AlbumLibrary = InferModel<typeof album_library, 'select'>;
export const selectAlbumLibrary = () => {
	return mediaDb.select()
		.from(album_library)
		.all();
};
