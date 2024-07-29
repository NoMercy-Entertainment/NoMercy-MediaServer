import { Request, Response } from 'express-serve-static-core';

import { encodeFile } from '@server/functions/ffmpeg/encodeFolder';
import i18next from 'i18next';

export default function(req: Request, res: Response) {

	new Promise(async (resolve) => {
		const files = req.body.files as string[];
		const libraryId = req.body.libraryId as string;

		await i18next.changeLanguage('en');

		for (const file of files ?? []) {
			await encodeFile({
				path: file,
				libraryId,
			});
		}
		resolve(true);
	}).then(() => {
		//
	});

	res.json({
		status: 'success',
	});
}
