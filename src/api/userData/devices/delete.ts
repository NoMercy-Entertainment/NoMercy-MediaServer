import { Request, Response } from 'express-serve-static-core';

import Logger from '@server/functions/logger';

import { devices } from '@server/db/media/schema/devices';

export const deleteDevices = (req: Request, res: Response) => {

	try {
		mediaDb.delete(devices)
			.run();
		return res.json({
			success: 'true',
		});
	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: `Error deleting devices: ${error}`,
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong deleting devices: ${error}`,
		});

	}
};

export default deleteDevices;
