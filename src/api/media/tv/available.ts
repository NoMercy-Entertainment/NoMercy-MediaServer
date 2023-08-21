import { Request, Response } from 'express-serve-static-core';

import { tvs } from '@server/db/media/schema/tvs';
import { eq } from 'drizzle-orm';
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
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id }: { id: string; user_id: string }) => {
	return new Promise((resolve, reject) => {

		const tv = globalThis.mediaDb.query.tvs.findFirst({
			where: eq(tvs.id, parseInt(id, 10)),
			with: {
				seasons: {
					with: {
						episodes: {
							with: {
								videoFiles: true,
							},
						},
					},
				},
				library: {
					with: {
						library_user: true,
					},
				},
			},
		});

		if (!tv || (!tv?.library?.library_user?.some(l => l.user_id === user_id) && !isOwner(user_id))) {
			return reject({
				available: false,
				server: 'local',
			});
		}

		resolve({
			available: tv.seasons
				.map(s => s.episodes.map(e => e.videoFiles?.[0]))
				.flat()
				.filter(Boolean)
				.length > 0,
			server: 'local',
		});
	});
};
