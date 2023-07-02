import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { sortBy } from '../../../functions/stringArray';
import { selectAlbums } from '@/db/media/actions/albums';

export default function (req: Request, res: Response) {

	const music = selectAlbums(req.body.letter);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No albums',
		});
	}

	const result = {
		type: 'albums',
		data: sortBy(music.map((m) => {
			return {
				...m,
				type: 'album',
				Artist: m.album_artist,
				name: m.name?.replace(/["'\[\]*]/gu, ''),
				titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
				origin: deviceId,
				colorPalette: JSON.parse(m.colorPalette ?? '{}'),
			};
		}), 'titleSort'),
	};


	return res.json(result);
}
