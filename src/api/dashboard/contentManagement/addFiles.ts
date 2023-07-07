import { Request, Response } from 'express';

import { encodeFile } from '@/functions/ffmpeg/encodeFolder';
import i18next from 'i18next';

export default async function (req: Request, res: Response) {

	const files = req.body.files as string[];
	const libraryId = req.body.libraryId as string;

	i18next.changeLanguage('en');

	for (const file of files ?? []) {
		await encodeFile({ path: file, libraryId });
	}

	return res.json({
		status: 'success',
	});

}