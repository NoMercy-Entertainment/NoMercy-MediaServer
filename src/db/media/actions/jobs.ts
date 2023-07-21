
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { jobs } from '../schema/jobs';

export type NewJob = InferModel<typeof jobs, 'insert'>;
export const insertJob = (data: NewJob) => globalThis.mediaDb.insert(jobs)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [jobs.credit_id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Job = InferModel<typeof jobs, 'select'>;
export const selectJob = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.jobs.findMany({
			with: {
				crews: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(jobs)
		.all();
};
