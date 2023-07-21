import { encoderProfile_library } from '../schema/encoderProfile_library';
import { convertBooleans } from '@server/db/helpers';
import { InferModel } from 'drizzle-orm';

export type NewEncoderProfileLibrary = InferModel<typeof encoderProfile_library, 'insert'>;
export const insertEncoderProfileLibrary = (data: NewEncoderProfileLibrary) => globalThis.mediaDb.insert(encoderProfile_library)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [encoderProfile_library.encoderProfile_id, encoderProfile_library.library_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type EncoderProfileLibrary = InferModel<typeof encoderProfile_library, 'select'>;
export const selectEncoderProfileLibrary = () => {
	return globalThis.mediaDb.select()
		.from(encoderProfile_library)
		.get();
};
