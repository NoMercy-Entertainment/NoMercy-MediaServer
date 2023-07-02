import { Request, Response } from 'express';
import { sortBy } from '../../../functions/stringArray';

import { getLanguage } from '../../middleware';
import { mediaDb } from '@/db/media';
import { eq, isNull, or } from 'drizzle-orm';
import { translations } from '@/db/media/schema/translations';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	try {

		const items = mediaDb.query.collections.findMany({
			limit: req.body.take,
			offset: req.body.page,
			with: {
				collection_movie: {
					columns: {},
					with: {
						movie: true,
					},
				},
				translations: {
					where: or(
						eq(translations.iso6391, language),
						isNull(translations.iso6391)
					),
				},
			},
		});

		const data = items.map((collection) => {
			const title: string = collection.translations[0]?.title ?? collection.title;

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
			: body.length + req.body.page;

		return res.json({
			nextId: nextId,
			data: body,
		});

	} catch (error) {
		return res.status(401).json({
			nextId: undefined,
			data: [],
			error,
		});
	}
}
