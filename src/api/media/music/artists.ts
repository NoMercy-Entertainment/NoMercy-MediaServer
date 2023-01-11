import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { sortBy } from '../../../functions/stringArray';

export default async function (req: Request, res: Response) {

	const music = await confDb.artist.findMany({
		where: {
			NOT: {
				Track: {
					none: {},
				},
			},
		},
		orderBy: {
			name: 'asc',
		},
		include: {
			_count: {
				select: {
					Track: true,
					Album: true,
				},
			},
		},
	});

	if (music) {

		const result: any = {
			type: 'artists',
			data: [],
		};

		result.data = sortBy(music.filter(m => m._count.Track > 0)
			.map((m) => {
				return {
					...m,
					type: 'artist',
					name: m.name.replace(/["'\[\]*]/gu, ''),
					titleSort: createTitleSort(m.name.replace(/["'\[\]*]/gu, '')),
					origin: deviceId,
				};
			}), 'titleSort');

		return res.json(result);
	}


	return res.json({});


}
