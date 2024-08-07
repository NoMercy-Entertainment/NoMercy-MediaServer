import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { notification_user } from '../schema/notification_user';

export type NewUserNotification = InferModel<typeof notification_user, 'insert'>;
export const insertUserNotification = (data: NewUserNotification) => globalThis.mediaDb.insert(notification_user)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [notification_user.notification_id, notification_user.user_id],
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type UserNotification = InferModel<typeof notification_user, 'select'>;
export const selectUserNotification = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.notification_user.findMany({
			with: {
				notification: true,
				user: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(notification_user)
		.all();
};
