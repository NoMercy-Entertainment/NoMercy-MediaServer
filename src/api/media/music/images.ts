import { Request, Response } from 'express';

import { artistImages } from '../../../functions/artistImage';

export default async function (req: Request, res: Response) {

	const { artist } = req.query;

	const urls = (await artistImages(artist as string));

	if (urls.length == 0) {
		return res.status(404).json({ message: 'Can not find images for this artist' });
	}
	return res.json(urls);
}
