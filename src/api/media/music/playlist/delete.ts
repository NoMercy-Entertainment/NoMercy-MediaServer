import { Request, Response } from 'express';

import { confDb } from "../../../../database/config";

export default async function (req: Request, res: Response) {

	const music = await confDb.playlist.delete({
		where: {
			id: req.params.id,
		},

	});

	return res.json(music);

}
