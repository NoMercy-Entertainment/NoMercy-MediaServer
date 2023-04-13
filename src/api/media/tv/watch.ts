import { Request, Response } from 'express';
import { join } from 'path';
import requestCountry from 'request-country';
import { KAuthRequest } from 'types/keycloak';

import { confDb } from '../../../database/config';
import { Prisma } from '../../../database/config/client';
import storeTvShow from '../../../tasks/data/storeTvShow';
import { createBaseFolder, EP } from '../../../tasks/files/filenameParser';
import { getLanguage } from '../../middleware';
import data from './data';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const id = req.params.id;
	// const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	// const owner = isOwner(req as KAuthRequest);
	const country = requestCountry(req, 'US');

	const files: any[] = [];

	const Type = 'tv';

	const libraryId = await confDb.library.findFirst({
		where: {
			type: Type,
		},
	}).then(l => l?.id ?? '');

	const tv = await confDb.tv.findFirst(tvQuery({ id, language, country, user }));
	if (
		tv
		&& tv.Season
		&& (tv?.Season?.map(s => s.Episode?.flat())
			.flat()
			.flat().length > 0)
	) {
		for (const season of tv.Season) {
			for (const episode of season.Episode) {
				const item = await data({ data: episode });
				files.push(item);
			}
		};

		if (files.length > 0) {
			return res.json(files.filter(f => f?.season != 0).concat(...files.filter(f => f?.season == 0))
				.filter(Boolean));
		}
	}

	await confDb.tv.findFirst(tvQuery({ id, language, country, user })).then(async (tv) => {
		if (
			!tv
			|| !tv.Season
			|| (tv?.Season?.map(s => s.Episode?.flat())
				.flat()
				.flat().length == 0)
		) {
			return;
		}
		const episode = tv.Season.find(s => s.seasonNumber == 1)?.Episode.find(e => e.episodeNumber == 1);
		if (!episode) return;
		const folder = join(episode.Tv.Library.Folders[0].folder!.path, createBaseFolder(episode as unknown as EP));
		await storeTvShow({ id: parseInt(id, 10), libraryId, folder: folder });
	});

	confDb.tv.findFirst(tvQuery({ id, language, country, user })).then(async (tv) => {
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

		return res.json(files.filter(f => f?.season != 0).concat(...files.filter(f => f?.season == 0))
			.filter(Boolean));
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
