import { convertBooleans } from '../../helpers';
import { InferModel, eq } from 'drizzle-orm';
import { seasons } from '../schema/seasons';

export type NewSeason = InferModel<typeof seasons, 'insert'>;
export const insertSeason = (data: NewSeason) => globalThis.mediaDb.insert(seasons)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: seasons.id,
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Season = InferModel<typeof seasons, 'select'>;
export const selectSeasons = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.seasons.findMany({
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
	return globalThis.mediaDb.select()
		.from(seasons)
		.all();
};

export const selectSeason = (data: {seasonNumber: number; tv_id: number}) => {

	return globalThis.mediaDb.select()
		.from(seasons)
		.where(eq(seasons.seasonNumber, data.seasonNumber))
		.where(eq(seasons.tv_id, data.tv_id))
		.get();
};
