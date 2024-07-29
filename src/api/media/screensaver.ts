import { Request, Response } from 'express-serve-static-core';
import { shuffle, sortBy, unique } from '@server/functions/stringArray';

import Logger from '@server/functions/logger';
import { LogoResponse } from '@server/types/server';
import { and, desc, eq, or, gte, isNull } from 'drizzle-orm';
import { images } from '@server/db/media/schema/images';

export default function(req: Request, res: Response) {

	try {

		const data = globalThis.mediaDb.query.images.findMany({
			where: or(
				and(
					eq(images.type, 'backdrop'),
					gte(images.voteAverage, 2),
					isNull(images.iso6391)
				),
				and(
					eq(images.type, 'logo'),
					eq(images.iso6391, 'en')
				)
			),
			orderBy: desc(images.voteAverage),
			with: {
				movie: true,
				tv: true,
			},
		});

		const tvCollection: typeof data = [];
		const movieCollection: typeof data = [];

		unique(data.filter(i => i.tv && i.type == 'backdrop'), 'tv_id')
			.map(data => tvCollection.push(data));

		unique(data.filter(i => i.movie && i.type == 'backdrop'), 'movie_id')
			.map(data => movieCollection.push(data));

		const tv: LogoResponse[] = tvCollection.map((r) => {
			const logo = sortBy(data.filter(i => i.type === 'logo'), 'voteAverage')
				.find(i => i.tv_id === r.tv_id);

			return {
				aspectRatio: r?.aspectRatio,
				src: r?.filePath,
				color_palette: JSON.parse(r?.colorPalette ?? '{}'),
				meta: {
					title: r?.tv?.title as string,
					logo: logo
						?						{
							aspectRatio: logo.aspectRatio,
							src: logo.filePath,
						}
						:						null,
				},
			};
		})
			.filter(i => i.meta.logo);

		const movie: LogoResponse[] = movieCollection.map((r) => {
			const logo = sortBy(data.filter(i => i.type === 'logo'), 'voteAverage')
				.find(i => i.movie_id === r.movie_id);

			return {
				aspectRatio: r?.aspectRatio,
				src: r?.filePath,
				color_palette: JSON.parse(r?.colorPalette ?? '{}'),
				meta: {
					title: r?.movie?.title as string,
					logo: logo
						?						{
							aspectRatio: logo.aspectRatio,
							src: logo.filePath,
						}
						:						null,
				},
			};
		})
			.filter(i => i.src && i.meta.logo);

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
