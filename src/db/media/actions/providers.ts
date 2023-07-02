import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { providers } from '../schema/providers';

export type NewProvider = InferModel<typeof providers, 'insert'>;
export const insertProvider = (data: NewProvider) => mediaDb.insert(providers)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: providers.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Provider = InferModel<typeof providers, 'select'>;
export const selectProvider = () => {
	return mediaDb.select()
		.from(providers)
		.all();
};
