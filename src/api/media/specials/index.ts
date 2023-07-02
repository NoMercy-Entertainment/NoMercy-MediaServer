import { Request, Response } from 'express';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { mediaDb } from '@/db/media';
import { sortBy } from '@/functions/stringArray';

export default function (req: Request, res: Response) {

	const items = mediaDb.query.specials.findMany({
		limit: req.body.take,
		offset: req.body.page,
	});

	const data = items.map((special) => {
		return {
			...special,
			titleSort: createTitleSort(special.title),
			colorPalette: special.colorPalette
				? JSON.parse(special.colorPalette)
				: null,
			type: 'special',
			mediaType: 'special',
		};
	});

	const body = sortBy(data, 'titleSort');

	const nextId = body.length < req.body.take
		? undefined
		: body.length + req.body.page;

	return res.json({
		nextId: nextId,
		data: body,
	});

}
