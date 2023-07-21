
import { mediaDb } from '@server/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { artist_musicGenre } from '../schema/artist_musicGenre';

export type NewArtistMusicGenre = InferModel<typeof artist_musicGenre, 'insert'>;
export const insertArtistMusicGenre = (data: NewArtistMusicGenre) => mediaDb.insert(artist_musicGenre)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [artist_musicGenre.artist_id, artist_musicGenre.musicGenre_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type ArtistMusicGenre = InferModel<typeof artist_musicGenre, 'select'>;
export const selectArtistMusicGenre = () => {
	return mediaDb.select()
		.from(artist_musicGenre)
		.get();
};
