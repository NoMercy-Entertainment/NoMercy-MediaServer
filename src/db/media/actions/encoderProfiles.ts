import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { mediaDb } from '@server/db/media';
import { encoderProfiles } from '../schema/encoderProfiles';
import { createId } from '@paralleldrive/cuid2';

export type NewEncoderProfile = InferModel<typeof encoderProfiles, 'insert'>;
export const insertEncoderProfile = (data: NewEncoderProfile) => mediaDb.insert(encoderProfiles)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: encoderProfiles.name,
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

export type EncoderProfile = InferModel<typeof encoderProfiles, 'select'>;
export const selectEncoderProfile = (relations = false) => {
	if (relations) {
		return mediaDb.query.encoderProfiles.findMany({
			with: {
				encoderProfile_library: true,
			},
		});
	}
	return mediaDb.select()
		.from(encoderProfiles)
		.all();
};

