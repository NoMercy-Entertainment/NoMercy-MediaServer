
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '../../helpers';
import { devices } from '../schema/devices';

export type NewDevice = InferModel<typeof devices, 'insert'>;
export const insertDevice = (data: NewDevice) => globalThis.mediaDb.insert(devices)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [devices.id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Device = InferModel<typeof devices, 'select'>;
export const selectDevice = (relations = false) => {
	if (relations) {
		// @ts-ignore
		return globalThis.mediaDb.query.devices.findMany({
			with: {
				activityLogs: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(devices)
		.all();
};
