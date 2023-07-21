import { Request, Response } from 'express';

import { mediaDb } from '@server/db/media';
import { eq } from 'drizzle-orm';
import { movies } from '@server/db/media/schema/movies';
import { requestWorker } from '@server/api/requestWorker';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		language: req.language,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id, language }: { id: string; user_id: string; language: string }) => {
	return new Promise(async (resolve, reject) => {

		const movie = mediaDb.query.movies.findFirst({
			where: eq(movies.id, parseInt(id, 10)),
			with: {
				videoFiles: true,
				library: {
					with: {
						library_user: true,
					},
				},
			},
		});

		if (!movie?.library?.library_user?.some(l => l.user_id === user_id)) {
			return resolve({
				error: {
					code: 404,
					message: 'Movie not found',
				},
			});
		}

		resolve({
			available: true,
			server: 'local',
		});
	});
}
