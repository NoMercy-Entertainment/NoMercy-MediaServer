import { InferModel } from 'drizzle-orm';
import { mediaDb } from '..';
import { certification_tv } from '../schema/certification_tv';
import { convertBooleans } from '@/db/helpers';

export type NewCertificationTv = InferModel<typeof certification_tv, 'insert'>;
export const insertCertificationTv = (data: NewCertificationTv) => mediaDb.insert(certification_tv)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [certification_tv.tv_id, certification_tv.certification_id, certification_tv.iso31661],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type CertificationTv = InferModel<typeof certification_tv, 'select'>;
export const selectCertificationTv = () => {
	return mediaDb.select()
		.from(certification_tv)
		.get();
};
