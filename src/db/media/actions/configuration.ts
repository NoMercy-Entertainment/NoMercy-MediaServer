
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { configuration } from '../schema/configuration';

export type NewConfiguration = InferModel<typeof configuration, 'insert'>;
export const insertConfiguration = (data: NewConfiguration) => globalThis.mediaDb.insert(configuration)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: configuration.key,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Configuration = InferModel<typeof configuration, 'select'>;
export const selectConfiguration = () => {
	return globalThis.mediaDb.select()
		.from(configuration)
		.all();
};
