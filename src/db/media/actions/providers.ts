import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { providers } from '../schema/providers';

export type NewProvider = InferModel<typeof providers, 'insert'>;
export const insertProvider = (data: NewProvider) => globalThis.mediaDb.insert(providers)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: providers.id,
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Provider = InferModel<typeof providers, 'select'>;
export const selectProvider = () => {
	return globalThis.mediaDb.select()
		.from(providers)
		.all();
};
