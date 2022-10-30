import { Keyword, KeywordMovie, KeywordTv, Media, Movie, Tv } from '@prisma/client'
import { Request, Response } from 'express';
import { shuffle, unique } from '../../functions/stringArray';

import Logger from '../../functions/logger';
import { LogoResponse } from 'types/server';
import { confDb } from '../../database/config';

export default async function (req: Request, res: Response) {
	let backdrops: (Media & {
		Movie:
		| (Movie & {
			Keyword: (KeywordMovie & {
				Keyword: Keyword;
			})[];
		})
		| null;
		Tv:
		| (Tv & {
			Keyword: (KeywordTv & {
				Keyword: Keyword;
			})[];
		})
		| null;
	})[] = [];

	let logos: Media[] = [];
	let tvLogos: Media[] = [];
	let movieLogos: Media[] = [];

	await confDb.media
		.findMany({
			where: {
				type: 'backdrop',
				voteAverage: {
					gte: 5,
				},
				iso6391: null,
			},
			orderBy: {
				voteAverage: 'desc',
			},
			include: {
				Movie: {
					include: {
						Keyword: {
							include: {
								Keyword: true,
							},
						},
					},
				},
				Tv: {
					include: {
						Keyword: {
							include: {
								Keyword: true,
							},
						},
					},
				},
			},
		})
		.then((data) => backdrops.push(...data))
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'moviedb',
				color: 'redBright',
				message: 'Error fetching backdrops ' + error,
			});
		});

	const tvCollection: (Media & {
		Movie:
		| (Movie & {
			Keyword: (KeywordMovie & {
				Keyword: Keyword;
			})[];
		})
		| null;
		Tv:
		| (Tv & {
			Keyword: (KeywordTv & {
				Keyword: Keyword;
			})[];
		})
		| null;
	})[] = [];

	unique(
		backdrops.filter((i) => i.Tv),
		'tvId'
	).map((data) => tvCollection.push(data));

	const movieollection: (Media & {
		Movie:
		| (Movie & {
			Keyword: (KeywordMovie & {
				Keyword: Keyword;
			})[];
		})
		| null;
		Tv:
		| (Tv & {
			Keyword: (KeywordTv & {
				Keyword: Keyword;
			})[];
		})
		| null;
	})[] = [];

	unique(
		backdrops.filter((i) => i.Movie),
		'movieId'
	).map((data) => movieollection.push(data));

	await confDb.media
		.findMany({
			where: {
				OR: [
					{
						type: 'logo',
						tvId: {
							in: tvCollection.map((b) => b.tvId!),
						},
					},
					{
						type: 'logo',
						movieId: {
							in: movieollection.map((b) => b.movieId!),
						},
					},
				],
			},
		})
		.then((data) => logos.push(...data))
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'moviedb',
				color: 'redBright',
				message: 'Error fetching logos ' + error,
			});
		});

	unique(
		logos.filter((i) => i.movieId),
		'movieId'
	).map((data) => movieLogos.push(data));

	unique(
		logos.filter((i) => i.tvId),
		'tvId'
	).map((data) => tvLogos.push(data));

	const tv: LogoResponse[] = tvCollection.map((r) => {
		const logo = tvLogos.find((l) => l.tvId == r.tvId);

		return {
			aspectRatio: r.aspectRatio,
			src: r.src,
			colorPalette: JSON.parse(r.colorPalette ?? '{}'),
			meta: {
				title: r?.Tv?.title,
				tags: r?.Tv?.Keyword?.map((k: { Keyword: Keyword }) => k.Keyword.name)
					.sort((a, b) => a.length - b.length)
					.filter(k => k.split(' ').length < 3)
					.slice(0, 3),
				logo: logo
					? {
						aspectRatio: logo.aspectRatio,
						src: logo.src,
					}
					: null,
			},
		};
	}).filter((r) => r?.meta?.logo);

	const movie: LogoResponse[] = movieollection.map((r) => {
		const logo = movieLogos.find((l) => l.movieId == r.movieId);

		return {
			aspectRatio: r.aspectRatio,
			src: r.src,
			colorPalette: JSON.parse(r.colorPalette ?? '{}'),
			meta: {
				title: r?.Movie?.title,
				tags: r?.Movie?.Keyword?.map((k: { Keyword: Keyword }) => k.Keyword.name)
					.sort((a, b) => a.length - b.length)
					.filter(k => k.split(' ').length < 3)
					.slice(0, 3),
				logo: logo
					? {
						aspectRatio: logo.aspectRatio,
						src: logo.src,
					}
					: null,
			},
		};
	}).filter((r) => r?.meta?.logo);

	const response: LogoResponse[] = shuffle([...tv, ...movie]);

	return res.json(response);
}
