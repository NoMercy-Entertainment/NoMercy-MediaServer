import { ActivityLog, Device, User } from '@prisma/client';
import {
  AppState,
  useSelector,
} from '../../../state/redux';
import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default async (req: Request, res: Response) => {

	const sub_id = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

    const {type, device_os, time, from, device_name, version} = req.body;

    storeServerActivity({sub_id, device_id: deviceId, type, device_os, time, from, device_name, version})
        .then((data) => {

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
        })
};

type data = ActivityLog & {
    user: User;
    device: Device;
};
export const storeServerActivity = async ({sub_id, device_id, type, device_os, time, from, device_name, version}): Promise<data> => {

	const socket = useSelector((state: AppState) => state.system.socket);

    return new Promise((resolve, reject) => {
        confDb.activityLog
            .create({
                data: {
                    from,
                    time,
                    type,
                    user: {
                        connect: {
                            sub_id
                        },
                    },
                    device: {
                        connectOrCreate: {
                            where: {
                                id: device_id,
                            },
                            create: {
                                id: device_id,
                                deviceId: device_id,
                                title: device_name.toTitleCase(),
                                type: device_os,
                                version,
                            }
                        }
                    },
                },
                include: {
                    device: true,
                    user: true,
                },
            })
            .then(async (data) => {
                Logger.log({
                    level: 'info',
                    name: 'activity',
                    color: 'magentaBright',
                    message: `New activity: ${JSON.stringify(data, null, 2)}`,
                });
                socket.emit('addActivityLog', data);
                const devices = await confDb.device.findMany();
                socket.emit('setDevices', devices);
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};