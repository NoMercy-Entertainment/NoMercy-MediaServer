import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express-serve-static-core';

import { insertActivityLog } from '@server/db/media/actions/activityLogs';
import { insertDevice, selectDevice } from '@server/db/media/actions/devices';

export default (req: Request, res: Response) => {

	const { from, id, browser, os, device, type, name, version, activity_type } = req.body as {[key: string]: string};

	storeServerActivity({ sub_id: req.user.sub, from, id, browser, os, device, type, name, version, activity_type })
		.then((data: any) => {

			return res.json({
				...data,
				user: data.user.name,
				device: data.device.title,
			});
		})
		.catch((error) => {
			return res.json({
				status: 'error',
				message: `Something went wrong getting server activities: ${error}`,
			});
		});
};

export const storeServerActivity = ({ sub_id, from, id, browser, os, device, type, name, version, activity_type }) => {

	const socket = useSelector((state: AppState) => state.system.socket);

	if (!id) {
		return Promise.resolve();
	};

	return new Promise((resolve) => {
		try {
			const d = insertDevice({
				id: id,
				device_id: id,
				browser,
				os,
				device,
				type,
				name,
				version,
				ip: from,
			});

			const data = insertActivityLog({
				time: Date.now(),
				type: activity_type,
				user_id: sub_id,
				device_id: d.id as string,
			});

			socket.emit('addActivityLog', data);
			const devices = selectDevice();
			socket.emit('setDevices', devices);
			socket.emit('update_content', ['devices']);
			resolve(data);
		} catch (error) {
			console.log(error);
		}
	});
};
