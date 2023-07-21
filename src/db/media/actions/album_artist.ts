import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { album_artist } from '../schema/album_artist';

export type NewAlbumArtist = InferModel<typeof album_artist, 'insert'>;
export const insertAlbumArtist = (data: NewAlbumArtist) => globalThis.mediaDb.insert(album_artist)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [album_artist.album_id, album_artist.artist_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type AlbumArtist = InferModel<typeof album_artist, 'select'>;
export const selectAlbumArtist = () => {
	return globalThis.mediaDb.select()
		.from(album_artist)
		.all();
};
