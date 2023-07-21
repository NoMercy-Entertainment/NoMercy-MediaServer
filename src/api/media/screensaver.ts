import { Request, Response } from 'express';
import { shuffle, unique } from '@server/functions/stringArray';

import Logger from '@server/functions/logger';
import { LogoResponse } from '@server/types/server';
import { Media } from '@server/db/media/actions/medias';
import { mediaDb } from '@server/db/media';
import { and, desc, gte, inArray, isNull } from 'drizzle-orm';
import { medias } from '@server/db/media/schema/medias';

export default function (req: Request, res: Response) {

	try {

		const logos: Media[] = [];
		const tvLogos: Media[] = [];
		const movieLogos: Media[] = [];

		const data = mediaDb.query.medias.findMany({
			where: and(
				inArray(medias.type, ['backdrop', 'poster', 'logo']),
				gte(medias.voteAverage, 5),
				isNull(medias.iso6391)
			),
			orderBy: desc(medias.voteAverage),
			with: {
				movie: true,
				tv: true,
			},
		});

		const tvCollection: typeof data = [];

		unique(
			data.filter(i => i.tv),
			'tvId'
		).map(data => tvCollection.push(data));

		const movieCollection: typeof data = [];

		unique(
			data.filter(i => i.movie),
			'movieId'
		).map(data => movieCollection.push(data));

		unique(
			logos.filter(i => i.movie_id),
			'movieId'
		).map(data => movieLogos.push(data));

		unique(
			logos.filter(i => i.tv_id),
			'tvId'
		).map(data => tvLogos.push(data));

		const tv: LogoResponse[] = tvCollection.map((r) => {
			const logo = tvLogos.find(l => l.tv_id == r.tv_id);

			return {
				aspectRatio: r.aspectRatio,
				src: r.src,
				colorPalette: JSON.parse(r.colorPalette ?? '{}'),
				meta: {
					title: r?.tv?.title as string,
					logo: logo
						? {
							aspectRatio: logo.aspectRatio,
							src: logo.src,
						}
						: null,
				},
			};
		}).filter(r => r?.meta?.logo);

		const movie: LogoResponse[] = movieCollection.map((r) => {
			const logo = movieLogos.find(l => l.movie_id == r.movie_id);

			return {
				aspectRatio: r.aspectRatio,
				src: r.src,
				colorPalette: JSON.parse(r.colorPalette ?? '{}'),
				meta: {
					title: r?.movie?.title as string,
					logo: logo
						? {
							aspectRatio: logo.aspectRatio,
							src: logo.src,
						}
						: null,
				},
			};
		}).filter(r => r?.meta?.logo);

		const response: LogoResponse[] = shuffle([...tv, ...movie]);

		return res.json(response);
	} catch (error) {

		Logger.log({
			level: 'error',
			name: 'moviedb',
			color: 'redBright',
			message: `Error fetching backdrops ${error}`,
		});

		return res.json({
			status: 'error',
			message: `Something went wrong getting backdrops: ${error}`,
		});

	}
}
