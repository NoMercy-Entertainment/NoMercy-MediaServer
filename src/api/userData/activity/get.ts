import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { ActivityLog, Device, User } from '../../../database/config/client';
import Logger from '../../../functions/logger';

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
		confDb.activityLog
			.findMany({
				include: {
					device: true,
					user: true,
				},
				orderBy: {
					time: 'desc',
				},
			})
			.then((data) => {
				resolve(data);
			})
			.catch((error) => {
				reject(error);
			});
	});

};
