import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { translations } from '../schema/translations';
import { createId } from '@paralleldrive/cuid2';

export type NewTranslation = InferModel<typeof translations, 'insert'>;
export const insertTranslation = (data: NewTranslation, constraint: 'movie' | 'tv' | 'season' | 'episode' | 'collection' | 'person') => globalThis.mediaDb.insert(translations)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [
			translations[`${constraint}_id`],
			translations.iso31661,
			translations.iso6391,
		],
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Translation = InferModel<typeof translations, 'select'>;
export const selectTranslation = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.translations.findMany({
			with: {
				tv: true,
				season: true,
				episode: true,
				movie: true,
				collection: true,
				person: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(translations)
		.all();
};
