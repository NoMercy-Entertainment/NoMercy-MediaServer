
import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '../../helpers';
import { devices } from '../schema/devices';

export type NewDevice = InferModel<typeof devices, 'insert'>;
export const insertDevice = (data: NewDevice) => globalThis.mediaDb.insert(devices)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [devices.id],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Device = InferModel<typeof devices, 'select'>;
export const selectDevices = () => {
	return globalThis.mediaDb.query.devices.findMany({
		with: {
			activityLogs: true,
		},
	});
};
