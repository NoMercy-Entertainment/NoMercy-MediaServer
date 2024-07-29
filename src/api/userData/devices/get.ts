import { selectDevices } from '@server/db/media/actions/devices';
import { Request, Response } from 'express-serve-static-core';

export const devices = (req: Request, res: Response) => {

	const data = selectDevices();

	return res.json(
		data.map(d => ({
			...d,
		}))
	);
};

export default devices;
