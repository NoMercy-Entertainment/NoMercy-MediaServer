import { Request, Response } from 'express';

import type { GenreResponse } from './genres.d';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { generateBlurHash } from '../../../functions/createBlurHash/createBlurHash';
import { sortBy } from '../../../functions/stringArray';

export default async function (req: Request, res: Response): Promise<Response<GenreResponse>> {

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

	if (!music) {
		return res.json({
			status: 'error',
			message: 'No genres',
		});
	}

	const result: GenreResponse = {
		type: 'genres',
		data: sortBy(music.filter(m => m._count.Track > 10)
			.map((m) => {
				return {
					...m,
					type: 'genre',
					name: m.name?.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
					origin: deviceId,
					blurHash: generateBlurHash(),
				};
			}), 'titleSort'),
	};

	return res.json(result);
}
