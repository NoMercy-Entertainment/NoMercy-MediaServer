import { Request, Response } from 'express';

import downloadImage from "../../../functions/downloadImage";
import { storageArtistImageInDatabase } from "../../../functions/artistImage";

export default async function (req: Request, res: Response) {

	const { name, image, storagePath } = req.body;

	downloadImage(image, `${JSON.parse((process.env.CONFIG as string)).mediaRoot}/Music/${storagePath}`)
		.then(async () => {

			await storageArtistImageInDatabase(name, storagePath);

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
