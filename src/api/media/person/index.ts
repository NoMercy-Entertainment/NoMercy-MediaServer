import { requestWorker } from '@server/api/requestWorker';
import { people } from '@server/db/media/schema/people';
import { and, desc, isNotNull, like } from 'drizzle-orm';
import { Request, Response } from 'express';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		name: req.body.name,
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

export const exec = ({ take, page, name, language }: { id: string, take: number; page: number; name: string, language: string }) => {
	return new Promise((resolve, reject) => {
		try {
			const data = globalThis.mediaDb.query.people.findMany({
				limit: take,
				offset: page,
				where: and(
					name !== undefined && name !== ''
						? like(people.name, `${name}%`)
						: isNotNull(people.name),
					isNotNull(people.profile)
				),
				orderBy: desc(people.popularity),
			});

			const response = data.map((person) => {
				return {
					...person,
					poster: person.profile,
					mediaType: 'person',
					titleSort: undefined,
					colorPalette: person.colorPalette
						? JSON.parse(person.colorPalette)
						: null,
				};
			});

			const nextId = response.length < take
				? undefined
				: response.length + page;

			return resolve({
				nextId: nextId,
				data: response,
			});
		} catch (error) {
			reject({
				error: {
					code: 404,
					message: error,
				},
			});
		}
	});
}
