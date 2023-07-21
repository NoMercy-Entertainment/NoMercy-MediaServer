import { Request, Response } from 'express';

import Logger from '@server/functions/logger';

export const encoderProfiles = (req: Request, res: Response) => {

	try {
		const data = globalThis.mediaDb.query.encoderProfiles.findMany();
		return res.json(
			data.map(d => ({
				...d,
				param: undefined,
				container: [{ key: d.container, val: d.container }],
				params: JSON.parse(d.param),
			}))
		);

	} catch (error) {
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
	}
};

export interface updateEncoderProfilesParams {
	sub_id: string;
}
export const createEncoderProfiles = async (req: Request, res: Response) => {
	//
};

export interface updateEncoderProfilesParams {
	sub_id: string;
}
export const updateEncoderProfiles = async (req: Request, res: Response) => {
	//
};
