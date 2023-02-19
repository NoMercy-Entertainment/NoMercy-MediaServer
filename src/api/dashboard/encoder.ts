import { Request, Response } from 'express';
import { ResponseStatus } from 'types/server';

import { confDb } from '../../database/config';
import Logger from '../../functions/logger';

export const encoderProfiles = async (req: Request, res: Response): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	await confDb.encoderProfile
		.findMany({
			// include: {
			//     libraries: true,
			// }
		})
		.then((data) => {
			return res.json(
				data.map(d => ({
					...d,
					param: undefined,
					container: [{ key: d.container, val: d.container }],
					params: JSON.parse(d.param),
				}))
			);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting encoder profiles: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong getting encoder profiles: ${error}`,
			});
		});
};

export interface updateEncoderProfilesParams {
	sub_id: string;
}
export const createEncoderProfiles = async (
	req: Request,
	res: Response
): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	//
};

export interface updateEncoderProfilesParams {
	sub_id: string;
}
export const updateEncoderProfiles = async (
	req: Request,
	res: Response
): Promise<Response<any, Record<string, ResponseStatus>> | void> => {
	//
};
