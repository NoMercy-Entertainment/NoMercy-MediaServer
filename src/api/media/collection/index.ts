import { Request, Response } from 'express';
import { sortBy } from '../../../functions/stringArray';

import { confDb } from '../../../database/config';
import { getLanguage } from '../../middleware';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const cursorQuery = (req.body.page as number) ?? undefined;
	const skip = cursorQuery
		? 1
		: 0;
	const cursor = cursorQuery
		? { id: cursorQuery }
		: undefined;

	const collections = await confDb.collection.findMany({
		where: {
			parts: {
				gt: 0,
			},
		},
		skip,
		take: req.body.take,
		cursor,
		include: {
			Movie: true,
			Translation: {
				where: {
					iso6391: language,
				},
			},
		},
	});

	const data = collections.map((collection) => {

		const title = collection.Translation[0]?.title ?? collection.title;

		return {
			...collection,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: collection.titleSort,
			blurHash: collection.blurHash
				? JSON.parse(collection.blurHash)
				: null,
			colorPalette: JSON.parse(collection.colorPalette ?? '{}'),
			have_parts: collection.parts,
			type: 'collection',
			mediaType: 'collection',
		};
	});

	const body = sortBy(data, 'titleSort');

	const nextId = body.length < req.body.take
		? undefined
		: body[req.body.take - 1]?.id;

	return res.json({
		nextId: nextId,
		data: body,
	});

}
