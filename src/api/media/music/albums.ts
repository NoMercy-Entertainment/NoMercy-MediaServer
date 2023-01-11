import { Request, Response } from 'express';

import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { sortBy } from '../../../functions/stringArray';

export default async function (req: Request, res: Response) {

	const music = await confDb.album.findMany({
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
			Artist: true,
			_count: {
				select: {
					Track: true,
				},
			},
		},
	});

	if (music) {

		const result: any = {
			type: 'albums',
		};

		result.data = sortBy(music.map((m) => {
			return {
				...m,
				type: 'album',
				Artist: m.Artist,
				name: m.name?.replace(/["'\[\]*]/gu, ''),
				titleSort: createTitleSort(m.name?.replace(/["'\[\]*]/gu, '') ?? ''),
				origin: deviceId,
			};
		}), 'titleSort');


		return res.json(result);
	}


	return res.json({});


}
