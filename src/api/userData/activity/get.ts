import { Request, Response } from 'express';

import Logger from '@server/functions/logger';
import { ActivityLog } from '@server/db/media/actions/activityLogs';
import { Device } from '@server/db/media/actions/devices';
import { User } from '@server/db/media/actions/users';
import { desc } from 'drizzle-orm';
import { activityLogs } from '@server/db/media/schema/activityLogs';

export default (req: Request, res: Response) => {

	getServerActivity()
		.then((data) => {
			return res.json(
				data.map(d => ({
					...d,
					user: d.user.name,
					device: d.device.name,
				}))
			);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting server activities: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong getting server activities: ${error}`,
			});
		});
};

type data = (ActivityLog & {
    device: Device;
    user: User;
})[];

export const getServerActivity = (): Promise<data> => {

	return new Promise((resolve, reject) => {

		try {
			// @ts-ignore
			const data = globalThis.mediaDb.query.activityLogs.findMany({
				with: {
					device: true,
					user: true,
				},
				orderBy: desc(activityLogs.time),
			});

			resolve(data);

		} catch (error) {
			reject(error);
		}
	});

};
