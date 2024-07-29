import { Request, Response } from 'express-serve-static-core';

import { createTitleSort } from '../../../tasks/files/filenameParser';
import { parseYear } from '@server/functions/dateTime';
import { getClosestRating } from '@server/functions/stringArray';

export default function(req: Request, res: Response) {

	const items = globalThis.mediaDb.query.specials.findMany({
		limit: req.body.take,
		offset: req.body.page,
		with: {
			specialItems: {
				columns: {},
				with: {
					episode: {
						columns: {},
						with: {
							tv: {
								columns: {
									firstAirDate: true,
									voteAverage: true,
								},
								with: {
									certification_tv: {
										with: {
											certification: true,
										},
									},
								},
							},
						},
					},
					movie: {
						columns: {
							releaseDate: true,
							voteAverage: true,
						},
						with: {
							certification_movie: {
								with: {
									certification: true,
								},
							},
						},
					},
				},
			},
		},
	});

	const result = items.map((special) => {

		const lowestYear = special.specialItems?.reduce((a, b) => {
			return Math.min(a, parseYear(b?.episode?.tv?.firstAirDate as string) ?? parseYear(b?.movie?.releaseDate) ?? 0);
		}, 9999);

		const averageRating = special.specialItems?.reduce((a, b) => {
			return a + (b?.episode?.tv.voteAverage ?? b?.movie?.voteAverage ?? 0);
		}, 0) / special.specialItems?.length;

		const ratings = special.specialItems.map(s => s?.episode?.tv?.certification_tv ?? s?.movie?.certification_movie)
			?.map((cert) => {
				return cert?.flat() ?? [];
			})
			.flat();

		return {
			...special,
			overview: special.description,
			titleSort: createTitleSort(special.title),
			year: lowestYear,
			rating: getClosestRating(ratings, req.language),
			haveEpisodes: special.specialItems?.length,
			voteAverage: averageRating,
			color_palette: special.colorPalette
				?				JSON.parse(special.colorPalette)
				:				null,
			type: 'specials',
			mediaType: 'specials',
		};
	});


	if (req.body.version == 'lolomo') {

		const letters = '#abcdefghijklmnopqrstuvwxyz'.split('');

		const response = letters.map((letter) => {
			return {
				id: letter,
				title: letter.toUpperCase(),
				moreLink: '',
				items: letter == '#'
					?					result.filter(item => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].some(l => item.titleSort.startsWith(l)))
					:					result.filter(item => item.titleSort.startsWith(letter)),
			};
		})
			.filter(d => d.items.length > 0);

		const nextId = response.length < req.body.take
			?			undefined
			:			response.length + req.body.page;

		return res.json({
			nextId: nextId,
			data: response,
		});
	}

	const nextId = result.length < req.body.take
		?		undefined
		:		result.length + req.body.page;

	return res.json({
		nextId: nextId,
		data: result,
	});


}
