import { Request, Response } from 'express';

import { LibraryResponseContent } from '@/types/server';
import { createTitleSort } from '@/tasks/files/filenameParser';
import { parseYear } from '@/functions/dateTime';
import { and, asc, eq, gt, isNotNull, isNull, or } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { movies } from '@/db/media/schema/movies';
import { tvs } from '@/db/media/schema/tvs';
import { translations } from '@/db/media/schema/translations';
import { medias } from '@/db/media/schema/medias';
import { getLibrary } from '@/db/media/actions/libraries';
import { images } from '@/db/media/schema/images';

export default function (req: Request, res: Response) {
	try {
		const library = getLibrary(req, req.params.id);
		if (!library) return res.status(401).json({
			nextId: undefined,
			data: [],
		});

		const data = {
			tvs: mediaDb.query.tvs.findMany({
				limit: req.body.take,
				offset: req.body.page,
				where: and(
					eq(tvs.library_id, library.id!),
					gt(tvs.haveEpisodes, 0)
				),
				with: {
					userData: true,
					medias: {
						orderBy: asc(medias.voteAverage),
					},
					images: {
						columns: {
							filePath: true,
							type: true,
						},
						where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
					},
					translations: {
						where: or(
							eq(translations.iso6391, req.language),
							isNull(translations.iso6391)
						),
					},
				},
				orderBy: asc(tvs.titleSort),
			}),
			movies: mediaDb.query.movies.findMany({
				limit: req.body.take,
				offset: req.body.page,
				where: and(
					eq(tvs.library_id, library.id!),
					isNotNull(movies.folder)
				),
				with: {
					userData: true,
					medias: {
						orderBy: asc(medias.voteAverage),
					},
					images: {
						columns: {
							filePath: true,
							type: true,
						},
						where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
					},
					translations: {
						where: or(
							eq(translations.iso6391, req.language),
							isNull(translations.iso6391)
						),
					},
					videoFiles: true,
				},
				orderBy: asc(movies.titleSort),
			}),
		};

		const response = getContent(data);

		const nextId = response.length < req.body.take
			? undefined
			: response.length + req.body.page;

		return res.json({
			nextId: nextId,
			data: response,
		});
	} catch (error) {
		console.log(error);
	}

}

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
