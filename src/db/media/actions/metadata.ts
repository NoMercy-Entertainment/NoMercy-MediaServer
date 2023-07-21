import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { metadata } from '../schema/metadata';
import { createId } from '@paralleldrive/cuid2';

export type NewMetadata = InferModel<typeof metadata, 'insert'>;
export const insertMetadata = (data: NewMetadata) => globalThis.mediaDb.insert(metadata)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: metadata.title,
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

export type Metadata = InferModel<typeof metadata, 'select'>;
export const selectMetadata = () => {
	return globalThis.mediaDb.select()
		.from(metadata)
		.all();
};
