
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '../../helpers';
import { mediaDb } from '@/db/media';
import { createId } from '@paralleldrive/cuid2';
import { devices } from '../schema/devices';

export type NewDevice = InferModel<typeof devices, 'insert'>;
export const insertDevice = (data: NewDevice) => mediaDb.insert(devices)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [devices.device_id, devices.type, devices.name, devices.version],
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
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
