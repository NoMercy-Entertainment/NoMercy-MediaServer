
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { activityLogs } from '../schema/activityLogs';

export type NewActivityLog = InferModel<typeof activityLogs, 'insert'>;
export const insertActivityLog = (data: NewActivityLog) => globalThis.mediaDb.insert(activityLogs)
	.values({
		...convertBooleans(data),
	})
	.returning()
	.get();

export type ActivityLog = InferModel<typeof activityLogs, 'select'>;
export const selectActivityLog = () => {
	return globalThis.mediaDb.select()
		.from(activityLogs)
		.all();
};
