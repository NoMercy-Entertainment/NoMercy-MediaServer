import { Movie, Tv } from '../../database/config/client';
import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import { confDb } from '../../database/config';
import { getLanguage } from '../middleware';
import { isOwner } from '../middleware/permissions';
import { parseYear } from '@/functions/dateTime';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const cursorQuery = (req.body.page as number) ?? undefined;
	const skip = cursorQuery
		? 1
		: 0;
	const cursor = cursorQuery
		? { id: cursorQuery }
		: undefined;

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const genres = await confDb.genre.findMany({
		orderBy: {
			name: 'asc',
		},
		skip,
		take: req.body.take,
		cursor,
		include: {
			Movie: {
				where: {
					Movie: {
						VideoFile: {
							some: {
								duration: {
									not: null,
								},
							},
						},
						Library: {
							User: {
								some: {
									userId: owner
										? undefined
										: user,
								},
							},
						},
					},
				},
				include: {
					Movie: {
						include: {
							Translation: {
								where: {
									iso6391: language,
								},
							},
							Media: true,
						},
					},
				},
			},
			Tv: {
				where: {
					Tv: {
						Episode: {
							some: {
								VideoFile: {
									some: {
										duration: {
											not: null,
										},
									},
								},
							},
						},
						Library: {
							User: {
								some: {
									userId: owner
										? undefined
										: user,
								},
							},
						},
					},
				},
				include: {
					Tv: {
						include: {
							Translation: {
								where: {
									iso6391: language,
								},
							},
							Media: {
								orderBy: {
									voteAverage: 'desc',
								},
							},
						},
					},
				},
			},
		},
	});

	const data = genres.map((genre) => {
		const items = [
			...genre.Movie.map(m => ({
				...m.Movie,
				Translation: m.Movie.Translation,
				Media: m.Movie.Media,
			})),
			...genre.Tv.map(t => ({
				...t.Tv,
				Translation: t.Tv.Translation,
				Media: t.Tv.Media,
			})),
		];

		return {
			id: genre.id,
			title: genre.name,
			moreLink: '',
			items: items.map((d) => {

				const logo = d.Media.find(m => m.type == 'logo');
				const palette = JSON.parse(d.colorPalette ?? '{}');

				return {
					id: d.id,
					backdrop: d.backdrop,
					logo: logo?.src ?? undefined,
					overview: d.overview,
					poster: d.poster,
					title: d.title,
					titleSort: d.titleSort,
					type: (d as Tv).firstAirDate
						? 'tv'
						: 'movie',
					year: parseYear((d as Tv).firstAirDate ?? (d as Movie).releaseDate),
					mediaType: (d as Tv).firstAirDate
						? 'tv'
						: 'movie',
					colorPalette: palette,
				};
			})
				.sort(() => Math.random() - 0.5)
				.slice(0, 35),
		};
	});


	const nextId = data.length < req.body.take
		? undefined
		: data[req.body.take - 1]?.id;

	return res.json({
		nextId: nextId,
		data: data,
	});

}
