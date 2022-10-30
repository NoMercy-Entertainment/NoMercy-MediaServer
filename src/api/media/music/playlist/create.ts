import { Request, Response } from 'express';

import { KAuthRequest } from "types/keycloak";
import { confDb } from "../../../../database/config";

export default async function (req: Request, res: Response) {

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;

	if (await confDb.playlist.findFirst({
		where: {
			name: req.body.name,
		},
	})) {
		return res.status(401).json({
			success: false,
			message: 'This playlist already exists.',
		});
	}

	const music = await confDb.playlist.create({
		data: {
			name: req.body.name,
			description: req.body.description,
			userId: user,
		},
	});

	return res.json(music);

}
