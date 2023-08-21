import { Request, Response } from 'express-serve-static-core';

import { parseYear } from '@server/functions/dateTime';
import { asc, inArray } from 'drizzle-orm';
import { genres } from '@server/db/media/schema/genres';
import { tvs } from '@server/db/media/schema/tvs';
import { getAllowedLibraries } from '@server/db/media/actions/libraries';
import { Movie } from '@server/db/media/actions/movies';
import { Tv } from '@server/db/media/actions/tvs';
import { requestWorker } from '../requestWorker';

export default async function (req: Request, res: Response) {

	const allowedLibraries = getAllowedLibraries(req);

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		allowedLibraries: allowedLibraries,
		limit: req.body.limit,
		offset: req.body.page,
		take: req.body.take,
		page: req.body.page,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ allowedLibraries, language, limit, offset, take, page }:
	{ allowedLibraries: string[]; language: string; limit: number; offset: number; take: number; page: number }) => {
	return new Promise(async (resolve, reject) => {

		if (!allowedLibraries || allowedLibraries.length == 0) {
			return reject({
				error: {
					code: 404,
					message: 'No libraries found',
				},
			});
		}

		try {
			const genresResponse = globalThis.mediaDb.query.genres.findMany({
				limit,
				offset,
				orderBy: asc(genres.name),
				with: {
					genre_movie: true,
					genre_tv: true,
				},
			});

			const movieGids = genresResponse.map(g => g.genre_movie.map(m => m.movie_id)).flat();
			const moviesResponse = movieGids.length == 0
				? []
				: globalThis.mediaDb.query.movies.findMany({
					where: (movies, { sql, and }) => and(
						sql`json_array_length(${movies.videoFiles}) > 0`,
						inArray(movies.id, movieGids)
					),
					with: {
						videoFiles: true,
					},
				});

			const tvGids = genresResponse.map(g => g.genre_tv.map(t => t.tv_id)).flat();
			const tvsResponse = tvGids.length == 0
				? []
				: globalThis.mediaDb.query.tvs.findMany({
					where: inArray(tvs.id, tvGids),
				});

			const translationsResponse = globalThis.mediaDb.query.translations.findMany({
				where: (translations, { eq, and, or }) => or(
					and(
						eq(translations.iso6391, language),
						inArray(translations.tv_id, tvGids)
					),
					and(
						eq(translations.iso6391, language),
						inArray(translations.movie_id, movieGids)
					)
				),
			});

			const imagesResponse = globalThis.mediaDb.query.images.findMany({
				where: (images, { eq, and, or }) => or(
					and(
						eq(images.type, 'logo'),
						inArray(images.tv_id, tvGids)
					),
					and(
						eq(images.type, 'logo'),
						inArray(images.movie_id, movieGids)
					)
				),
			});

			const episodesResponse = globalThis.mediaDb.query.episodes.findMany({
				where: episodes => inArray(episodes.tv_id, tvsResponse.map(t => t.id)),
				columns: {
					id: true,
				},
				with: {
					videoFiles: {
						columns: {
							id: true,
							duration: true,
						},
					},
				},
			});

			const data = genresResponse.map((genre) => {
				const items = [
					...genre.genre_movie.map(m => ({
						...moviesResponse.find(mr => mr.id == m.movie_id),
						translations: translationsResponse.filter(tr => tr.movie_id == m.movie_id),
						images: imagesResponse.filter(ir => ir.movie_id == m.movie_id),
					})).filter(m => m?.videoFiles && m.videoFiles?.length > 0),

					...genre.genre_tv.map(t => ({
						...tvsResponse.find(tr => tr.id == t.tv_id),
						translations: translationsResponse.filter(tr => tr.tv_id == t.tv_id),
						images: imagesResponse.filter(ir => ir.tv_id == t.tv_id),
						videoFiles: episodesResponse?.map(e => e.videoFiles).flat(),
					})).filter(t => t?.videoFiles?.length > 0),
				];

				return {
					id: genre.id,
					title: genre.name,
					moreLink: '',
					items: items.map((d) => {
						const type = (d as Tv).firstAirDate
							? 'tv'
							: 'movie';

						const logo = d.images?.find(m => m.type == 'logo');

						const palette = JSON.parse(d.colorPalette ?? '{}');

						const translation = d.translations?.[0];

						return {
							id: d.id,
							backdrop: d.backdrop,
							// @ts-ignore
							logo: logo?.filePath ?? logo?.src ?? undefined,
							overview: !translation?.overview || translation?.overview == ''
								? d.overview
								: translation?.overview,
							poster: d.poster,
							title: d.title,
							titleSort: d.titleSort,
							type: type,
							year: parseYear((d as Tv).firstAirDate ?? (d as Movie).releaseDate),
							mediaType: type,
							colorPalette: palette,
						};
					})
						.sort(() => Math.random() - 0.5)
						.slice(0, 35),
				};
			});

			const nextId = data.length < take
				? undefined
				: data.length + page;

			return resolve({
				nextId: nextId,
				data: data.filter(d => d.items.length > 0),
			});
		} catch (error) {
			console.log(error);
			return reject({
				error: {
					code: 501,
					message: error,
				},
			});
		}
	});
};
