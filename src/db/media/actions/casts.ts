
import { mediaDb } from '@/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { casts } from '../schema/casts';

export type NewCast = InferModel<typeof casts, 'insert'>;
export const insertCast = (data: NewCast) => mediaDb.insert(casts)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [casts.id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Cast = InferModel<typeof casts, 'select'>;
export const selectCast = (relations = false) => {
	if (relations) {
		return mediaDb.query.casts.findMany({
			with: {
				person: true,
				movie: true,
				tv: true,
				season: true,
				episode: true,
				images: true,
				roles: true,
			},
		});
	}
	return mediaDb.select()
		.from(casts)
		.all();
};
