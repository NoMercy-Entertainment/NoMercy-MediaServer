import { convertBooleans } from '../../helpers';
import { InferModel, eq } from 'drizzle-orm';
import { users } from '../schema/users';

export type NewUser = InferModel<typeof users, 'insert'>;
export const insertUser = (data: NewUser) => globalThis.mediaDb.insert(users)
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
		return globalThis.mediaDb.query.users.findMany({
			with: {
				library_user: true,
				notification_user: true,
				activityLogs: true,
				userData: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(users)
		.all();
};

export const updateUser = (data: Partial<User> & { id: string }) => globalThis.mediaDb.update(users)
	.set({
		...convertBooleans(data),
	})
	.where(eq(users.id, data.id))
	.returning()
	.get();
