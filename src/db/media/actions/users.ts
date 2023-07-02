import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { users } from '../schema/users';

export type NewUser = InferModel<typeof users, 'insert'>;
export const insertUser = (data: NewUser) => mediaDb.insert(users)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: users.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type User = InferModel<typeof users, 'select'>;
export const selectUser = (relations = false) => {
	if (relations) {
		return mediaDb.query.users.findMany({
			with: {
				library_user: true,
				notification_user: true,
				activityLogs: true,
				userData: true,
			},
		});
	}
	return mediaDb.select()
		.from(users)
		.all();
};
