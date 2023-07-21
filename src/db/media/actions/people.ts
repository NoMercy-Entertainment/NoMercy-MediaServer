
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { people } from '../schema/people';

export type NewPerson = InferModel<typeof people, 'insert'>;
export const insertPeople = (data: NewPerson) => mediaDb.insert(people)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [people.id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Person = InferModel<typeof people, 'select'>;
export const selectPeople = (relations = false) => {
	if (relations) {
		return mediaDb.query.people.findMany({
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
	return mediaDb.select()
		.from(people)
		.all();
};
