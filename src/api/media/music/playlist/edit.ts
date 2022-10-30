import { Request, Response } from 'express';

import { confDb } from "../../../../database/config";

export default async function (req: Request, res: Response) {

	const { name, description }: { name: string, description:string } = req.body;

	const music = await confDb.playlist.update({
		where: {
			id: req.params.id,
		},
		data: {
			name: name,
			description: description,
		}
	});

	return res.json(music);

}
