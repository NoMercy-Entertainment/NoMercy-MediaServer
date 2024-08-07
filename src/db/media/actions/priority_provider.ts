import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { priority_provider } from '../schema/priority_provider';

export type Newpriority_provider = InferModel<typeof priority_provider, 'insert'>;
export const insertProviderPriority = (data: Newpriority_provider) => globalThis.mediaDb.insert(priority_provider)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [priority_provider.provider_id, priority_provider.country],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Provider = InferModel<typeof priority_provider, 'select'>;
export const selectProviderPriority = () => {
	return globalThis.mediaDb.select()
		.from(priority_provider)
		.all();
};
