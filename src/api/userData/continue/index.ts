import { Request, Response } from 'express';
import { groupBy, mappedEntries, unique } from '@server/functions/stringArray';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { selectFromUserData } from '@server/db/media/actions/userData';

export default function (req: Request, res: Response) {

	const result = selectFromUserData({ user_id: req.user.sub });

	const datas = mappedEntries(groupBy(result, 'type'))
		.map((d) => {
			if (d[0] == 'tv') {
				return {
					type: unique(d[1], 'tv_id'),
				};
			}
			if (d[0] == 'movie') {
				return {
					type: unique(d[1], 'movie_id'),
				};
			}
			if (d[0] == 'special') {
				return {
					type: unique(d[1], 'special_id'),
				};
			}
		});

	const data: any[] = [];

	for (const t of datas) {

		t?.type?.map((d) => {
			const x = d?.special ?? d?.tv ?? d?.movie;
			if (!x) return;

			data.push({
				id: x.id,
				mediaType: d.type,
				poster: x.poster,
				title: x.title[0].toUpperCase() + x.title.slice(1),
				titleSort: createTitleSort(x.title),
				type: d.type,
				updatedAt: x.updated_at,
				colorPalette: x.colorPalette
					? JSON.parse(x.colorPalette)
					: null,
			});
		}) ?? [];
	}

	return res.json(data);
}
