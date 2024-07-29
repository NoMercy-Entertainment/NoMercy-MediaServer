import { AppState, useSelector } from '@server/state/redux';
import { Request, Response } from 'express-serve-static-core';

import { insertActivityLog } from '@server/db/media/actions/activityLogs';
import { insertDevice, selectDevices } from '@server/db/media/actions/devices';

export default (req: Request, res: Response) => {

	const { from, id, browser, os, device, type, name, version, activity_type } = req.body as {[key: string]: string};

	const data = storeServerActivity({ sub_id: req.user.sub, from, id, browser, os, device, type, name, version, activity_type });

	return res.json(data);

};

export const storeServerActivity = ({ sub_id, from, id, browser, os, device, type, name, version, activity_type }) => {

	const socket = useSelector((state: AppState) => state.system.socket);

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
		const devices = selectDevices();

		socket.emit('addActivityLog', data);
		socket.emit('setDevices', devices);
		socket.emit('update_content', ['devices']);

		return data;
	} catch (error) {
		console.log(error);
	}
};
