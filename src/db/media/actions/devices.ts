
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '../../helpers';
import { mediaDb } from '@server/db/media';
import { devices } from '../schema/devices';

export type NewDevice = InferModel<typeof devices, 'insert'>;
export const insertDevice = (data: NewDevice) => mediaDb.insert(devices)
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
		return mediaDb.query.devices.findMany({
			with: {
				activityLogs: true,
			},
		});
	}
	return mediaDb.select()
		.from(devices)
		.all();
};
