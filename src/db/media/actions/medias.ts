import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { medias } from '../schema/medias';

export type NewMedia = InferModel<typeof medias, 'insert'>;
export const insertMedia = (data: NewMedia) => mediaDb.insert(medias)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: medias.src,
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

export type Media = InferModel<typeof medias, 'select'>;
export const selectMedia = (relations = false) => {
	if (relations) {
		return mediaDb.query.medias.findMany({
			with: {
				person: true,
				movie: true,
				tv: true,
				season: true,
				episode: true,
			},
		});
	}
	return mediaDb.select()
		.from(medias)
		.all();
};
