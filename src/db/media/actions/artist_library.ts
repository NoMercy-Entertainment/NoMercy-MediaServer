
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { artist_library } from '../schema/artist_library';

export type NewArtistLibrary = InferModel<typeof artist_library, 'insert'>;
export const insertArtistLibrary = (data: NewArtistLibrary) => mediaDb.insert(artist_library)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [artist_library.artist_id, artist_library.library_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type ArtistLibrary = InferModel<typeof artist_library, 'select'>;
export const selectArtistLibrary = () => {
	return mediaDb.select()
		.from(artist_library)
		.all();
};
