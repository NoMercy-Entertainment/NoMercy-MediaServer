import {
    AppState,
    useSelector
} from '../../../state/redux';
import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';

export default (req: Request, res: Response) => {

	const sub_id = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

    const { type, device_os, time, from, device_name, version } = req.body;

    storeServerActivity({ sub_id, device_id: deviceId, type, device_os, time, from, device_name, version })
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

export const storeServerActivity = ({ sub_id, device_id, type, device_os, time, from, device_name, version }) => {

	const socket = useSelector((state: AppState) => state.system.socket);

    return new Promise((resolve, reject) => {
        confDb.activityLog
            .create({
                data: {
                    time,
                    type,
                    user: {
                        connect: {
                            sub_id,
                        },
                    },
                    device: {
                        connectOrCreate: {
                            where: {
                                id: device_id,
                            },
                            create: {
                                id: device_id,
                                ip: from,
                                deviceId: device_id,
                                title: device_name.toTitleCase(),
                                type: device_os,
                                version,
                            },
                        },
                    },
                },
                include: {
                    device: true,
                    user: true,
                },
            })
            .then(async (data) => {
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
