import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { certifications } from '../schema/certifications';

export type NewCertification = InferModel<typeof certifications, 'insert'>;
export const insertCertification = (data: NewCertification) => mediaDb.insert(certifications)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [certifications.iso31661, certifications.rating],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Certification = InferModel<typeof certifications, 'select'>;
export const selectCertification = ({ where }) => {
	return mediaDb.select()
		.from(certifications)
		.where(where)
		.all();
};
