
import { convertBooleans } from '../../helpers';
import { InferModel, desc, eq } from 'drizzle-orm';
import { activityLogs } from '../schema/activityLogs';

export type NewActivityLog = InferModel<typeof activityLogs, 'insert'>;
export const insertActivityLog = (data: NewActivityLog) => {
	const log = globalThis.mediaDb.insert(activityLogs)
		.values(convertBooleans(data))
		.returning()
		.get();

	return globalThis.mediaDb.query.activityLogs.findFirst({
		where: eq(activityLogs.id, log.id),
		with: {
			device: true,
			user: true,
		},
		orderBy: desc(activityLogs.time),
	});
};

export type ActivityLog = InferModel<typeof activityLogs, 'select'>;
export const selectActivityLogs = () => {

	return globalThis.mediaDb.query.activityLogs.findMany({
		with: {
			device: true,
			user: true,
		},
		orderBy: desc(activityLogs.time),
	});
};
