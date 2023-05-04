import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { Prisma } from '../../../database/config/client';
import { confDb } from '../../../database/config';
import data from './data';
import { getLanguage } from '../../middleware';
import requestCountry from 'request-country';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const id = req.params.id;
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const country = requestCountry(req, 'US');

	const files: any[] = [];

	confDb.tv.findFirst(tvQuery({ id, language, country, user }))
		.then(async (tv) => {
			if (
				!tv
				|| !tv.Season
				|| (tv?.Season?.map(s => s.Episode?.flat())
					.flat()
					.flat().length == 0)
			) {
				return res.json([]);
			}

			for (const season of tv.Season) {
				for (const episode of season.Episode) {
					const item = await data({ data: episode });
					files.push(item);
				}
			};

			const response = [
				...files.filter(f => f?.season != 0),
				...files.filter(f => f?.season == 0),
			].filter(Boolean);

			return res.json(response);
		});

}

interface TVQueryInterface {
	id: string;
	language: string;
	country: string;
	user: string;
}

const tvQuery = ({ id, language, country, user }: TVQueryInterface) => {
	return Prisma.validator<Prisma.TvFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
			Library: {
				User: {
					some: {
						userId: user,
					},
				},
			},
		},
		include: {
			Media: true,
			Season: {
				orderBy: {
					seasonNumber: 'asc',
				},
				include: {
					Media: true,
					Translation: {
						where: {
							iso31661: {
								in: [language.toUpperCase(), country],
							},
						},
					},
					Episode: {
						orderBy: {
							episodeNumber: 'asc',
						},
						include: {
							VideoFile: {
								include: {
									UserData: {
										where: {
											User: {
												sub_id: user,
											},
										},
									},
								},
							},
							Tv: {
								include: {
									Library: {
										include: {
											Folders: {
												include: {
													folder: true,
												},
											},
										},
									},
									Translation: {
										where: {
											iso31661: {
												in: [language.toUpperCase(), country],
											},
										},
									},
									Certification: {
										where: {
											iso31661: {
												in: [language.toUpperCase(), country],
											},
										},
										include: {
											Certification: true,
										},
									},
									Media: true,
								},
							},
							Media: true,
							Translation: {
								where: {
									iso31661: {
										in: [language.toUpperCase(), country],
									},
								},
							},
						},
					},
				},
			},
			Translation: {
				where: {
					iso31661: {
						in: [language.toUpperCase(), country],
					},
				},
			},
		},
	});
};
