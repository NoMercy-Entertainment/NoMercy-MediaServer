import { Request, Response } from 'express-serve-static-core';

import { eq } from 'drizzle-orm';
import { requestWorker } from '@server/api/requestWorker';
import { isOwner } from '@server/api/middleware/permissions';
import { specials } from '@server/db/media/schema/specials';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		language: req.language,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.json(result.error);
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id }: { id: string; user_id: string }) => {
	return new Promise((resolve, reject) => {

		const special = globalThis.mediaDb.query.specials.findFirst({
			where: eq(specials.id, id),
			columns: {},
			with: {
				specialItems: {
					columns: {},
					with: {
						episode: {
							columns: {},
							with: {
								tv: {
									columns: {},
									with: {
										library: {
											columns: {},
											with: {
												library_user: true,
											},
										},
									},
								},
							},
						},
						movie: {
							columns: {},
							with: {
								library: {
									columns: {},
									with: {
										library_user: true,
									},
								},
							},
						},
					},
				},
			},
		})?.specialItems;

		if (!special) return reject({
			available: false,
			server: 'local',
		});

		const data = special.map(s => (s.episode?.tv?.library ?? s.movie?.library)!.library_user).flat();

		if (!special || !data.some(s => s.user_id == user_id) || !isOwner(user_id)) {
			return reject({
				available: false,
				server: 'local',
			});
		}

		resolve({
			available: true,
			server: 'local',
		});
	});
};
