import { ActivityLog, Device, User } from '@prisma/client';
import { Request, Response } from 'express';

import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';

export default async (req: Request, res: Response) => {

    getServerActivity()
        .then((data) => {
			return res.json(
				data.map((d) => ({
					...d,
					user: d.user.name,
					device: d.device.title,
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

export const getServerActivity = async (): Promise<data> => {

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

}
