import { Request, Response } from 'express';

import { KAuthRequest } from '../../../types/keycloak';
import { mediaDb } from '@/db/media';
import { tvs } from '@/db/media/schema/tvs';
import { eq } from 'drizzle-orm';

export default function (req: Request, res: Response) {

	const user = (req as unknown as KAuthRequest).token.content.sub;

	const tv = mediaDb.query.tvs.findFirst({
		where: eq(tvs.id, parseInt(req.params.id, 10)),
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

	// @ts-ignore
	if (!tv?.library?.library_user?.some(l => l.user_id === user)) {
		return res.status(404).json({
			available: false,
			server: 'local',
		});
	}

	return res.json({
		status: 'ok',
		available: tv.seasons
			.map(s => s.episodes.map(e => e.videoFiles?.[0]))
			.flat()
			.filter(Boolean)
			.length > 0,
	});

}
