import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { notifications } from '../schema/notifications';

export type NewNotification = InferModel<typeof notifications, 'insert'>;
export const insertNotification = (data: NewNotification) => {
	return globalThis.mediaDb.insert(notifications)
		.values({
			...convertBooleans(data),
			id: data.id ?? createId(),
		})
		.onConflictDoUpdate({
			target: notifications.name,
			set: {
				...convertBooleans(data),
				id: data.id ?? undefined,
			},
		})
		.returning()
		.get();
};

export const selectNotification = () => {
	return globalThis.mediaDb.select()
		.from(notifications)
		.all();
};
