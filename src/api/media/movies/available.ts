import { Request, Response } from 'express-serve-static-core';

import { eq } from 'drizzle-orm';
import { movies } from '@server/db/media/schema/movies';
import { requestWorker } from '@server/api/requestWorker';
import { isOwner } from '@server/api/middleware/permissions';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		language: req.language,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.json(false);
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id }: { id: string; user_id: string }) => {
	return new Promise((resolve) => {

		const movie = globalThis.mediaDb.query.movies.findFirst({
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

		if (!movie?.library?.library_user?.some(l => l.user_id === user_id) && !isOwner(user_id)) {
			return resolve({
				error: {
					code: 404,
					message: 'Movie not found',
				},
			});
		}

		resolve({
			available: !!movie?.videoFiles?.find(v => v.duration)?.duration || false,
			server: 'local',
		});
	});
};
