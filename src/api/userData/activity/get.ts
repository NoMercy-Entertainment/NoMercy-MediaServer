import { Request, Response } from 'express-serve-static-core';

import { selectActivityLogs } from '@server/db/media/actions/activityLogs';

export default (req: Request, res: Response) => {

	const data = selectActivityLogs();

	return res.json(
		data.map(d => ({
			...d,
			user: d.user.name,
			device: d.device.name,
		}))
	);
};
