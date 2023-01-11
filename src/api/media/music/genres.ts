import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { generateBlurHash } from '../../../functions/createBlurHash/createBlurHash';
import { sortBy } from '../../../functions/stringArray';

export default async function (req: Request, res: Response) {

	const music = await confDb.musicGenre.findMany({
		where: {
			Track: {
				some: {
					id: {
						not: undefined,
					},
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
		include: {
			_count: true,
		},
	});

	if (music) {

		const result: any = {
			type: 'genres',
			data: [],
		};

		result.data = sortBy(music.filter(m => m._count.Track > 10)
			.map((m) => {
				return {
					...m,
					type: 'genre',
					name: m.name?.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
					origin: deviceId,
					blurHash: generateBlurHash(),
				};
			}), 'titleSort');

		return res.json(result);
	}


	return res.json({});


}
