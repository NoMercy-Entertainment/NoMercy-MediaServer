import { InferModel, eq } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { music_plays } from '../schema/music_plays';
import { groupBy } from '@server/functions/stringArray';

export type NewMusicPlays = InferModel<typeof music_plays, 'insert'>;
export const insertMusicPlays = (data: NewMusicPlays) => globalThis.mediaDb.insert(music_plays)
	.values(convertBooleans(data))
	.returning()
	.get();

export type MusicPlays = InferModel<typeof music_plays, 'select'>;
export type MusicPlaysWithRelations = ReturnType<typeof selectMusicPlays>;
export const selectMusicPlays = () => {
	return globalThis.mediaDb.query.music_plays.findMany({
		with: {
			track: true,
			user: true,
		},
	});
};

export type MusicPlaysWithRelationsFromUser = ReturnType<typeof selectFromMusicPlays>;
export const selectFromMusicPlays = ({ user_id }) => {

	const musicPlays = globalThis.mediaDb.query.music_plays.findMany({
		with: {
			track: true,
			user: true,
		},
		where: eq(music_plays.user_id, user_id),
	});

	const tracks = groupBy(musicPlays, 'track_id');

	const tracksWithPlayCounts = Object.keys(tracks).map((track) => {
		return {
			...tracks[track][0],
			play_count: tracks[track].length,
		};
	});

	return tracksWithPlayCounts;

};
