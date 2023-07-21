import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { certifications } from '../schema/certifications';

export type NewCertification = InferModel<typeof certifications, 'insert'>;
export const insertCertification = (data: NewCertification) => globalThis.mediaDb.insert(certifications)
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
	return globalThis.mediaDb.select()
		.from(certifications)
		.where(where)
		.all();
};
