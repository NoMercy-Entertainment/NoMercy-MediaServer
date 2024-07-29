import { Request, Response } from 'express-serve-static-core';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function (req: Request, res: Response) {

	// if (await confDb.playlist.findFirst({
	// 	where: {
	// 		name: req.body.name,
	// 	},
	// })) {
	// 	return res.status(401).json({
	// 		success: false,
	// 		message: 'This playlist already exists.',
	// 	});
	// }

	// const music = await confDb.playlist.create({
	// 	data: {
	// 		name: req.body.name,
	// 		description: req.body.description,
	// 		userId: req.user.sub,
	// 	},
	// });

	// return res.json(music);

}
