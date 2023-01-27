import { Request, Response } from 'express';

import { cachePath } from '../../../state';
import downloadImage from '../../../functions/downloadImage';
import { join } from 'path';
import { storageArtistImageInDatabase } from '../../../functions/artistImage';

export default function (req: Request, res: Response) {

	const { id, image, storagePath } = req.body;

	downloadImage(image, join(cachePath, 'images', 'music', storagePath))
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
