import { Request, Response } from 'express';

import fs from 'fs';

export default async function (req: Request, res: Response) {

	const fontsFolder = `${__dirname}/public/fonts`;

	if (!fs.existsSync(fontsFolder)) {
		fs.mkdirSync(fontsFolder);
	}

	const list = fs.readdirSync(fontsFolder);

	const body = list.map((f) => {
		return `/fonts/${f}`;
	});

	return res.json(body);
}
