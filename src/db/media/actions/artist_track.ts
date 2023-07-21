
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { artist_track } from '../schema/artist_track';

export type NewArtistTrack = InferModel<typeof artist_track, 'insert'>;
export const insertArtistTrack = (data: NewArtistTrack) => globalThis.mediaDb.insert(artist_track)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [artist_track.artist_id, artist_track.track_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type ArtistTrack = InferModel<typeof artist_track, 'select'>;
export const selectArtistTrack = () => {
	return globalThis.mediaDb.select()
		.from(artist_track)
		.all();
};
