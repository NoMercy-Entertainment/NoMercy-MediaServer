
import { InferModel } from 'drizzle-orm';

import { people } from '../schema/people';
import { convertBooleans } from '@server/db/helpers';

export type NewPerson = InferModel<typeof people, 'insert'>;
export const insertPeople = (data: NewPerson) => globalThis.mediaDb.insert(people)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [people.id],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Person = InferModel<typeof people, 'select'>;
export const selectPeople = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.people.findMany({
			with: {
				casts: true,
				crews: true,
				guestStars: true,
				creators: true,
				medias: true,
				translations: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(people)
		.all();
};
