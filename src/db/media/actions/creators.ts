import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { creators } from '../schema/creators';

export type NewCreator = InferModel<typeof creators, 'insert'>;
export const insertCreator = (data: NewCreator) => globalThis.mediaDb.insert(creators)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [creators.person_id, creators.tv_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Creator = InferModel<typeof creators, 'select'>;
export const selectCreator = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.creators.findMany({
			with: {
				person: true,
				tv: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(creators)
		.all();
};
