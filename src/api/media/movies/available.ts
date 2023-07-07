import { Request, Response } from 'express';

import { mediaDb } from '@/db/media';
import { eq } from 'drizzle-orm';
import { movies } from '@/db/media/schema/movies';

export default function (req: Request, res: Response) {

	const movie = mediaDb.query.movies.findFirst({
		where: eq(movies.id, parseInt(req.params.id, 10)),
		with: {
			videoFiles: true,
			library: {
				with: {
					library_user: true,
				},
			},
		},
	});

	// @ts-ignore
	if (!movie?.library?.library_user?.some(l => l.user_id === req.user.sub)) {
		return res.status(404).json({
			available: false,
			server: 'local',
		});
	}

	return res.json({
		status: 'ok',
		available: true,
	});
}
