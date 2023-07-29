import { Request, Response } from 'express-serve-static-core';


export const devices = (req: Request, res: Response) => {
	// confDb.device
	// 	.findMany({})
	// 	.then((data) => {
	// 		return res.json(
	// 			data.map(d => ({
	// 				...d,
	// 			}))
	// 		);
	// 	})
	// 	.catch((error) => {
	// 		Logger.log({
	// 			level: 'info',
	// 			name: 'access',
	// 			color: 'magentaBright',
	// 			message: `Error getting devices: ${error}`,
	// 		});
	// 		return res.json({
	// 			status: 'ok',
	// 			message: `Something went wrong getting devices: ${error}`,
	// 		});
	// 	});
};

export default devices;
