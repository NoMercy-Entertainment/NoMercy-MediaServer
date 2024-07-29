import { Request, Response } from 'express-serve-static-core';
import { sortBy } from '@server/functions/stringArray';

import { eq, inArray, isNull, or } from 'drizzle-orm';
import { translations } from '@server/db/media/schema/translations';
import { requestWorker } from '@server/api/requestWorker';
import { LibraryResponseContent } from '@server/types/server';
import { parseYear } from '@server/functions/dateTime';

export default async (req: Request, res: Response) => {

	const result = await requestWorker({
		filename: __filename,
		country: req.country,
		user_id: req.user.sub,
		take: req.body.take,
		page: req.body.page,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500)
			.json({
				status: 'error',
				message: result.error.message,
			});
	}

	if (req.body.version == 'lolomo') {

		const letters = '#abcdefghijklmnopqrstuvwxyz'.split('');

		const response = letters.map((letter) => {
			return {
				id: letter,
				title: letter.toUpperCase(),
				moreLink: '',
				items: letter == '#'
					?					result.result.filter(item => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].some(l => item.titleSort.startsWith(l)))
					:					result.result.filter(item => item.titleSort.startsWith(letter)),
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

	const nextId = result.result.length < req.body.take
		?		undefined
		:		result.result.length + req.body.page;

	return res.json({
		nextId: nextId,
		data: result.result,
	});
};

export const exec = ({
	take,
	page,
	country,
}: { take: number; page: number; country: string }) => {
	return new Promise((resolve, reject) => {
		try {

			const items = globalThis.mediaDb.query.collections.findMany({
				limit: take,
				offset: page,
				with: {
					collection_movie: {
						with: {
							movie: {
								with: {
									genre_movie: {
										with: {
											genre: true,
										},
									},
									certification_movie: {
										where: (certification_movie, {
											or,
											eq,
										}) => or(
											eq(certification_movie.iso31661, 'NL'),
											eq(certification_movie.iso31661, 'US')
										),
										with: {
											certification: true,
										},
									},
								},
							},
						},
					},
					translations: {
						where: or(
							eq(translations.iso6391, country),
							isNull(translations.iso6391)
						),
					},
				},
			});

			const movieGids = items.map(c => c.collection_movie.map(m => m.movie_id))
				.flat();

			const imagesResponse = globalThis.mediaDb.query.images.findMany({
				where: (images, {
					eq,
					and,
				}) => and(
					eq(images.type, 'logo'),
					eq(images.iso6391, 'en'),
					inArray(images.movie_id, movieGids)
				),
			});

			const response: LibraryResponseContent[] = [];

			for (const collection of items) {

				const title: string = collection.translations[0]?.title ?? collection.title;

				response.push({
					...collection,
					title: title[0].toUpperCase() + title.slice(1),
					titleSort: collection.titleSort,
					blurHash: collection.blurHash
						?						JSON.parse(collection.blurHash)
						:						null,
					color_palette: JSON.parse(collection.colorPalette ?? '{}'),
					type: 'collection',
					mediaType: 'collection',
					year: parseYear(collection.collection_movie
						.sort((a, b) => Date.parse(a.movie?.releaseDate as string) - Date.parse(b.movie?.releaseDate as string))[0]
						?.movie?.releaseDate),
					genres: collection.collection_movie?.map(p => ({
						id: p.movie?.genre_movie?.[0]?.genre?.id,
						name: p.movie?.genre_movie?.[0]?.genre?.name,
						item_id: p.movie?.id,
					})) ?? [],
					rating: collection.collection_movie?.map(p => p.movie)
						.sort((a, b) => Date.parse(a?.releaseDate as string) - Date.parse(b?.releaseDate as string))
						.map(p => ({
							rating: p.certification_movie?.[0]?.certification?.rating,
							iso31661: p.certification_movie?.[0]?.certification?.iso31661,
						}))
						?.find(p => p.rating && p.iso31661),
					logo: imagesResponse.find(i => i.movie_id == collection.id)?.filePath,
				});
			}

			const body = sortBy(response, 'titleSort');

			return resolve(body);

		} catch (error) {
			return reject({
				error: {
					message: error,
					code: 404,
				},
			});
		}
	});
};
