
import { mediaDb } from '@/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { musicGenre_track } from '../schema/musicGenre_track';

export type NewMusicGenreTrack = InferModel<typeof musicGenre_track, 'insert'>;
export const insertMusicGenreTrack = (data: NewMusicGenreTrack) => mediaDb.insert(musicGenre_track)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [musicGenre_track.track_id, musicGenre_track.musicGenre_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type MusicGenreTrack = InferModel<typeof musicGenre_track, 'select'>;
export const selectMusicGenreTrack = () => {
	return mediaDb.select()
		.from(musicGenre_track)
		.get();
};
