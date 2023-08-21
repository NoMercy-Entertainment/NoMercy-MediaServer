import {
	AppState,
	useSelector
} from '@server/state/redux';
import { Request, Response } from 'express-serve-static-core';


import { activityLogs } from '@server/db/media/schema/activityLogs';

export default (req: Request, res: Response) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	try {
		globalThis.mediaDb.delete(activityLogs)
			.run();
		socket.emit('setDevices', []);

		return res.json({
			status: 'success',
		});

	} catch (error) {
		return res.json({
			status: 'error',
			message: `Something went wrong getting server activities: ${error}`,
		});

	}

};
