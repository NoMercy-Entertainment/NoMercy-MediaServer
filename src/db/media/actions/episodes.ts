
import { convertBooleans } from '../../helpers';
import { InferModel, and, eq } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { episodes } from '../schema/episodes';

export type NewEpisode = InferModel<typeof episodes, 'insert'>;
export const insertEpisodeDB = (data: NewEpisode) => mediaDb.insert(episodes)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: episodes.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Episode = InferModel<typeof episodes, 'select'>;
export const getEpisodesDB = (relations = false) => {
	if (relations) {
		return mediaDb.query.episodes.findMany({
			with: {
				tv: true,
				season: true,
				casts: true,
				crews: true,
				specialItems: true,
				videoFiles: true,
				medias: true,
				guestStars: true,
				files: true,
				translations: true,
			},
		});
	}
	return mediaDb.select()
		.from(episodes)
		.all();
};

export const getEpisodeDB = (data: {seasonNumber: number; episodeNumber: number; tv_id: number}) => {

	return mediaDb.select()
		.from(episodes)
		.where(
			and(
				eq(episodes.seasonNumber, data.seasonNumber),
				eq(episodes.episodeNumber, data.episodeNumber),
				eq(episodes.tv_id, data.tv_id)
			)
		)
		.get();
};
