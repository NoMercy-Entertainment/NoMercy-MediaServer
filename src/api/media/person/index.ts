import { Request, Response } from 'express';

import { confDb } from '@/database/config';

export default async function (req: Request, res: Response) {

	const cursorQuery = (req.body.page as number) ?? undefined;
	const skip = cursorQuery
		? 1
		: 0;
	const cursor = cursorQuery
		? { id: cursorQuery }
		: undefined;

	// const language = getLanguage(req);

	const data = await confDb.person.findMany({
		skip,
		take: req.body.take,
		cursor,
		orderBy: {
			popularity: 'desc',
		},
		where: {
			name: {
				startsWith: req.body.name as string,
			},
		},
		include: {
			_count: true,
		},
	});

	const people = data.map((person) => {
		return {
			...person,
			poster: person.profile,
			mediaType: 'person',
			colorPalette: person.colorPalette
				? JSON.parse(person.colorPalette)
				: null,
		};
	});

	const nextId = people.length < req.body.take
		? undefined
		: people[req.body.take - 1]?.id;

	return res.json({
		nextId: nextId,
		data: people,
	});

}
