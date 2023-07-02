import { mediaDb } from '@/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { notification_user } from '../schema/notification_user';

export type NewUserNotification = InferModel<typeof notification_user, 'insert'>;
export const insertUserNotification = (data: NewUserNotification) => mediaDb.insert(notification_user)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [notification_user.notification_id, notification_user.user_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type UserNotification = InferModel<typeof notification_user, 'select'>;
export const selectUserNotification = (relations = false) => {
	if (relations) {
		return mediaDb.query.notification_user.findMany({
			with: {
				notification: true,
				user: true,
			},
		});
	}
	return mediaDb.select()
		.from(notification_user)
		.all();
};
