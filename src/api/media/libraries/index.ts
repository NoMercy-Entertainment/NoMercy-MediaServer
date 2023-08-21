import { Request, Response } from 'express-serve-static-core';

import { LibraryResponseContent } from '@server/types//server';
import { createTitleSort } from '@server/tasks/files/filenameParser';
import { parseYear } from '@server/functions/dateTime';
import { asc, gt, isNotNull, isNull } from 'drizzle-orm';
import { movies } from '@server/db/media/schema/movies';
import { tvs } from '@server/db/media/schema/tvs';
import { getAllowedLibrary } from '@server/db/media/actions/libraries';
import { requestWorker } from '@server/api/requestWorker';

export default async function (req: Request, res: Response) {

	const allowedLibrary = getAllowedLibrary(req, req.params.id);

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		allowedLibrary: allowedLibrary,
		take: req.body.take,
		page: req.body.page,
		id: req.params.id,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ id, take, page, allowedLibrary, language }:
	{ id: string, take: number; page: number; allowedLibrary: string, language: string }) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!allowedLibrary) return reject({
				error: {
					code: 404,
					message: 'Library not found',
				},
			});

			const data = {
				tvs: globalThis.mediaDb.query.tvs.findMany({
					limit: take,
					offset: page,
					where: (tvs, { eq, and }) => and(
						eq(tvs.library_id, id),
						gt(tvs.haveEpisodes, 0)
					),
					with: {
						images: {
							columns: {
								filePath: true,
								type: true,
							},
							where: (images, { eq }) => eq(images.type, 'logo'),
						},
						translations: {
							where: (translations, { eq, or }) => or(
								eq(translations.iso6391, language),
								isNull(translations.iso6391)
							),
						},
					},
					orderBy: asc(tvs.titleSort),
				}),
				movies: globalThis.mediaDb.query.movies.findMany({
					limit: take,
					offset: page,
					where: (tvs, { eq, and }) => and(
						eq(tvs.library_id, id),
						isNotNull(movies.folder)
					),
					with: {
						images: {
							columns: {
								filePath: true,
								type: true,
							},
							where: (images, { eq }) => (eq(images.type, 'logo')),
						},
						translations: {
							where: (translations, { eq, or }) => or(
								eq(translations.iso6391, language),
								isNull(translations.iso6391)
							),
						},
					},
					orderBy: asc(movies.titleSort),
				}),
			};

			const response = getContent(data);

			const nextId = response.length < take
				? undefined
				: response.length + page;

			return resolve({
				nextId: nextId,
				data: response,
			});
		} catch (error) {
			console.log(error);
		}
	});

};

export const getContent = (data: any) => {
	const response: LibraryResponseContent[] = [];
	if (!data) return response;

	for (const tv of data.tvs ?? []) {
		if (!tv) continue;

		const title = tv.translations.find(t => t.tvId == tv.id)?.title || tv.title;
		const overview = tv.translations.find(t => t.tvId == tv.id)?.overview || tv.overview;
		const logo = tv.images.find(m => m.type == 'logo');
		const userData = tv.userData?.[0];

		const palette = JSON.parse(tv.colorPalette ?? '{}');

		response.push({
			id: tv.id,
			backdrop: tv.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo?.filePath ?? null,
			mediaType: 'tv',
			numberOfEpisodes: tv.numberOfEpisodes ?? 1,
			haveEpisodes: tv.haveEpisodes ?? 0,
			overview: overview,
			colorPalette: {
				logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
				poster: palette?.poster ?? null,
				backdrop: palette?.backdrop ?? null,
			},
			poster: tv.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, tv.firstAirDate),
			type: 'tv',
			// genres: tv.Genre,
			year: parseYear(tv.firstAirDate),
		});
	}
	for (const movie of data.movies ?? []) {
		if (!movie) continue;

		const title = movie.translations.find(t => t.movieId == movie.id)?.title || movie.title;
		const overview
			= movie.translations.find(t => t.movieId == movie.id)?.overview || movie.overview;
		const logo = movie.images.find(m => m.type == 'logo');
		const userData = movie.UserData?.[0];

		const palette = JSON.parse(movie.colorPalette ?? '{}');

		response.push({
			id: movie.id,
			backdrop: movie.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo?.filePath ?? null,
			mediaType: 'movie',
			overview: overview,
			colorPalette: {
				logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
				poster: palette?.poster ?? null,
				backdrop: palette?.backdrop ?? null,
			},
			poster: movie.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, movie.releaseDate),
			type: 'movie',
			// genres: movie.Genre,
			year: parseYear(movie.releaseDate),
			collection: movie.CollectionFrom?.map(c => ({
				id: c.id,
				backdrop: c.backdrop,
				mediaType: 'collection',
				poster: c.poster,
				title: c.title[0].toUpperCase() + c.title.slice(1),
				titleSort: createTitleSort(c.title),
				colorPalette: JSON.parse(c.colorPalette ?? '[]'),
				type: 'collection',
			})),
		});
	}

	return response.sort((a, b) => a.titleSort.localeCompare(b.titleSort));
};
