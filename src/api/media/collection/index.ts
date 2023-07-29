import { Request, Response } from 'express-serve-static-core';
import { sortBy } from '@server/functions/stringArray';

import { eq, isNull, or } from 'drizzle-orm';
import { translations } from '@server/db/media/schema/translations';
import { requestWorker } from '@server/api/requestWorker';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		user_id: req.user.sub,
		take: req.body.take,
		page: req.body.page,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ take, page, user_id, language }: { take: number; page: number; user_id: string, language: string }) => {
	return new Promise(async (resolve, reject) => {
		try {

			const items = globalThis.mediaDb.query.collections.findMany({
				limit: take,
				offset: page,
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

			const nextId = body.length < take
				? undefined
				: body.length + page;

			return resolve({
				nextId: nextId,
				data: body,
			});

		} catch (error) {
			return reject({
				error: {
					message: error,
					code: 404,
				},
			});
		}
	});
}
