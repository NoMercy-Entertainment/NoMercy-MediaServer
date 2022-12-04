import { Request, Response } from 'express';

import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';

export const devices = async (req: Request, res: Response) => {
	confDb.device
		.deleteMany()
		.then(() => {
			return res.json({
				success: 'true',
			});
		})
		.catch((error) => {
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
		});
};

export default devices;