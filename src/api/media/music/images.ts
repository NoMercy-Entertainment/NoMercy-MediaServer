import { Request, Response } from 'express';

import { artistImages } from '../../../functions/artistImage';
import colorPalette from '../../../functions/colorPalette';

export default async function (req: Request, res: Response) {

	const { artist } = req.query;

	const urls = (await artistImages(artist as string));

	const promises: any[] = [];
	const response: any[] = [];

	for (const url of urls) {
		promises.push(async () => {
			response.push({
				...url,
				palette: await colorPalette(url.url),
			})
		});
	}

	await Promise.all(promises.map(r => r()));

	if (response.length == 0) {
		return res.status(404)
			.json({ 
				message: 'Can not find images for this artist'
			});
	}

	return res.json(response);
}
