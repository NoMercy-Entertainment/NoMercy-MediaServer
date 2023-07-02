
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { activityLogs } from '../schema/activityLogs';

export type NewActivityLog = InferModel<typeof activityLogs, 'insert'>;
export const insertActivityLog = (data: NewActivityLog) => mediaDb.insert(activityLogs)
	.values({
		...convertBooleans(data),
	})
	.returning()
	.get();

export type ActivityLog = InferModel<typeof activityLogs, 'select'>;
export const selectActivityLog = () => {
	return mediaDb.select()
		.from(activityLogs)
		.all();
};
