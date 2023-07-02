import { convertBooleans } from '../../helpers';
import { InferModel, eq } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { seasons } from '../schema/seasons';

export type NewSeason = InferModel<typeof seasons, 'insert'>;
export const insertSeason = (data: NewSeason) => mediaDb.insert(seasons)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: seasons.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Season = InferModel<typeof seasons, 'select'>;
export const selectSeasons = (relations = false) => {
	if (relations) {
		return mediaDb.query.posts.findMany({
			with: {
				casts: true,
				crews: true,
				episodes: true,
				medias: true,
				translations: true,
				tv: true,
			},
		});
	}
	return mediaDb.select()
		.from(seasons)
		.all();
};

export const selectSeason = (data: {seasonNumber: number; tv_id: number}) => {

	return mediaDb.select()
		.from(seasons)
		.where(eq(seasons.seasonNumber, data.seasonNumber))
		.where(eq(seasons.tv_id, data.tv_id))
		.get();
};
