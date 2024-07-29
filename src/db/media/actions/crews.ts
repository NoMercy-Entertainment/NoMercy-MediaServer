
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { crews } from '../schema/crews';

export type NewCrew = InferModel<typeof crews, 'insert'>;
export const insertCrew = (data: NewCrew) => globalThis.mediaDb.insert(crews)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [crews.id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Crew = InferModel<typeof crews, 'select'>;
export const selectCrew = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.crews.findMany({
			with: {
				person: true,
				movie: true,
				tv: true,
				season: true,
				episode: true,
				images: true,
				jobs: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(crews)
		.all();
};
