import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { runningTasks } from '../schema/runningTasks';

export type NewRunningTask = InferModel<typeof runningTasks, 'insert'>;
export const insertRunningTask = (data: NewRunningTask) => mediaDb.insert(runningTasks)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [runningTasks.title, runningTasks.type],
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

export type RunningTask = InferModel<typeof runningTasks, 'select'>;
export const selectRunningTask = () => {
	return mediaDb.select()
		.from(runningTasks)
		.all();
};
