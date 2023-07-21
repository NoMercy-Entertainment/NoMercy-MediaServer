
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { artist_library } from '../schema/artist_library';

export type NewArtistLibrary = InferModel<typeof artist_library, 'insert'>;
export const insertArtistLibrary = (data: NewArtistLibrary) => globalThis.mediaDb.insert(artist_library)
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
	return globalThis.mediaDb.select()
		.from(artist_library)
		.all();
};
