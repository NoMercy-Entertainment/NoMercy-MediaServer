import { Request, Response } from 'express';
import { join } from 'path';

import { storageArtistImageInDatabase } from '../../../functions/artistImage';
import downloadImage from '../../../functions/downloadImage';
import { cachePath } from '../../../state';

export default function (req: Request, res: Response) {

	const { id, image, storagePath } = req.body;

	downloadImage({
		url: image,
		path: join(cachePath, 'images', 'music', storagePath),
	})
		.then(async ({ colorPalette }) => {

			await storageArtistImageInDatabase(id, colorPalette);

			return res.json({
				success: true,
				message: 'Image successfully uploaded',
			});

		})
		.catch((reason) => {
			return res.status(400).json({
				success: false,
				message: 'Something went wring when downloading the image.',
				error: reason,
			});
		});
}
