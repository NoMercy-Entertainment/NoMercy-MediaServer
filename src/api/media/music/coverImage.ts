import { Request, Response } from 'express';

import { cachePath } from '@server/state';
import downloadImage from '@server/functions/downloadImage';
import { join } from 'path';
import { storageArtistImageInDatabase } from '@server/functions/artistImage';
import { AppState, useSelector } from '@server/state/redux';

export default function (req: Request, res: Response) {

	const { id, image, storagePath } = req.body;

	downloadImage({
		url: image,
		path: join(cachePath, 'images', 'music', storagePath),
	})
		.then(({ colorPalette }) => {

			storageArtistImageInDatabase(id, colorPalette);

			const socket = useSelector((state: AppState) => state.system.socket);
			socket.emit('update_content', ['music', 'artist', id, '_']);

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
