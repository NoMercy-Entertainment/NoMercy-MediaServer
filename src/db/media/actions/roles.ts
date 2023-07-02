
import { convertBooleans } from '../../helpers';
import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { roles } from '../schema/roles';

export type NewRole = InferModel<typeof roles, 'insert'>;
export const insertRole = (data: NewRole) => mediaDb.insert(roles)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [roles.credit_id, roles.cast_id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();
export const insertGuestRole = (data: NewRole) => mediaDb.insert(roles)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [roles.guest_id, roles.credit_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type Role = InferModel<typeof roles, 'select'>;
export const selectRole = (relations = false) => {
	if (relations) {
		return mediaDb.query.roles.findMany({
			with: {
				cast: true,
				guest: true,
			},
		});
	}
	return mediaDb.select()
		.from(roles)
		.all();
};
