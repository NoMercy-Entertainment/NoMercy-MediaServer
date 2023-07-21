import { Request, Response } from 'express';

import { artistImages } from '@server/functions/artistImage';

export default async function (req: Request, res: Response) {

	const { artist } = req.body;

	const urls = (await artistImages(artist as string));

	// const promises: any[] = [];
	// const response: any[] = [];

	// for (const url of urls) {
	// 	promises.push(async () => {
	// 		response.push({
	// 			...url,
	// 			palette: await colorPalette(url.url),
	// 		});
	// 	});
	// }

	// await Promise.all(promises.map(r => r()));

	if (urls.length == 0) {
		return res.status(404)
			.json({
				message: 'Can not find images for this artist',
			});
	}

	return res.json(urls);
}
