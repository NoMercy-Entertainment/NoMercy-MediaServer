import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { runningTasks } from '../schema/runningTasks';

export type NewRunningTask = InferModel<typeof runningTasks, 'insert'>;
export const insertRunningTask = (data: NewRunningTask) => globalThis.mediaDb.insert(runningTasks)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [runningTasks.title, runningTasks.type],
		set: {
			...convertBooleans(data, true),
			id: data.id ?? undefined,
		},
	})
	.returning()
	.get();

export type RunningTask = InferModel<typeof runningTasks, 'select'>;
export const selectRunningTask = () => {
	return globalThis.mediaDb.select()
		.from(runningTasks)
		.all();
};
