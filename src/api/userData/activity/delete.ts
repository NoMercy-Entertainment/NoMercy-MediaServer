import {
    AppState,
    useSelector
} from '@/state/redux';
import { Request, Response } from 'express';

import { confDb } from '../../../database/config';

export default (req: Request, res: Response) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	confDb.activityLog.deleteMany()
		.then(async() => {
			const devices = await confDb.device.findMany();
			socket.emit('setDevices', devices);

			return res.json({
				status: 'success',
			});
		})
		.catch((error) => {
			return res.json({
				status: 'error',
				message: `Something went wrong getting server activities: ${error}`,
			});
		});
};
