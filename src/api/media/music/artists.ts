import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { removeDiacritics, sortBy } from '../../../functions/stringArray';
import { selectArtists } from '@/db/media/actions/artists';

export default function (req: Request, res: Response) {

	const music = selectArtists(req.body.letter);

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No albums found',
		});
	}

	const result = {
		type: 'artists',
		data: sortBy(music
			.map((m) => {
				return {
					...m,
					type: 'artist',
					name: m.name.replace(/["'\[\]*]/gu, ''),
					titleSort: removeDiacritics(createTitleSort(m.name)),
					origin: deviceId,
					colorPalette: JSON.parse(m.colorPalette ?? '{}'),
				};
			}), 'titleSort'),
	};

	return res.json(result);
}
