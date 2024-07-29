import { Request, Response } from 'express-serve-static-core';

import { LibraryResponseContent } from '@server/types//server';
import { parseYear } from '@server/functions/dateTime';
import { asc, desc, gt, isNotNull, isNull } from 'drizzle-orm';
import { movies } from '@server/db/media/schema/movies';
import { tvs } from '@server/db/media/schema/tvs';
import { getAllowedLibrary } from '@server/db/media/actions/libraries';
import { requestWorker } from '@server/api/requestWorker';
import { images } from '@server/db/media/schema/images';
import { getClosestRating } from '@server/functions/stringArray';
import { priority } from '../helpers';

export default async function(req: Request, res: Response) {

	const allowedLibrary = getAllowedLibrary(req, req.params.id);

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		allowedLibrary: allowedLibrary,
		take: req.body.take,
		page: req.body.page,
		id: req.params.id,
		user_id: req.user.sub,
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
					? result.result.filter(item => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].some(l => item.titleSort.startsWith(l)))
					: result.result.filter(item => item.titleSort.startsWith(letter)),
			};
		})
			.filter(d => d.items.length > 0);

		const nextId = response.length < req.body.take
			? undefined
			: response.length + req.body.page;

		return res.json({
			nextId: nextId,
			data: response,
		});

	}

	const nextId = result.result.length < req.body.take
		? undefined
		: result.result.length + req.body.page;

	return res.json({
		nextId: nextId,
		data: result.result,
	});

}

export const exec = ({
	id,
	take,
	page,
	allowedLibrary,
	language,
	user_id,
}:
	{ id: string, take: number; page: number; allowedLibrary: string, language: string, user_id: string }) => {
	return new Promise((resolve, reject) => {
		try {
			if (!allowedLibrary) return reject({
				error: {
					code: 404,
					message: 'Library not found',
				},
			});

			const TVS = globalThis.mediaDb.query.tvs.findMany({
				limit: take,
				offset: page,
				where: (tvs, {
					eq,
					and,
				}) => and(
					eq(tvs.library_id, id),
					gt(tvs.haveEpisodes, 0)
				),
				with: {
					images: {
						columns: {
							filePath: true,
							color_palette: true,
							type: true,
							voteAverage: true,
						},
						where: (images, {
							eq,
							and,
						}) => and(
							eq(images.type, 'logo'),
							eq(images.iso6391, 'en')
						),
						orderBy: desc(images.voteAverage),
					},
					medias: {
						where: (medias, {
							eq,
							and,
						}) => and(
							eq(medias.type, 'Trailer'),
							eq(medias.iso6391, 'en')
						),
					},
					translations: {
						where: (translations, {
							eq,
							or,
						}) => or(
							eq(translations.iso6391, language),
							isNull(translations.iso6391)
						),
					},
					genre_tv: {
						with: {
							genre: true,
						},
					},
					certification_tv: {
						where: (certification_tv, {
							or,
							eq,
						}) => or(
							eq(certification_tv.iso31661, 'NL'),
							eq(certification_tv.iso31661, 'US')
						),
						columns: {
							tv_id: true,
						},
						with: {
							certification: {
								// columns: {
								// 	rating: true,
								// 	iso31661: true,
								// },
							},
						},
					},
					userData: {
						where: (userData, { eq }) => eq(userData.user_id, user_id),
					},
				},
				orderBy: asc(tvs.titleSort),
			});

			const MOVIES = globalThis.mediaDb.query.movies.findMany({
				limit: take,
				offset: page,
				where: (tvs, {
					eq,
					and,
				}) => and(
					eq(tvs.library_id, id),
					isNotNull(movies.folder)
				),
				with: {
					images: {
						columns: {
							filePath: true,
							color_palette: true,
							type: true,
							voteAverage: true,
						},
						where: (images, {
							eq,
							and,
						}) => and(
							eq(images.type, 'logo'),
							eq(images.iso6391, 'en')
						),
						orderBy: desc(images.voteAverage),
					},
					medias: {
						where: (medias, {
							eq,
							and,
						}) => and(
							eq(medias.type, 'Trailer'),
							eq(medias.iso6391, 'en')
						),
					},
					translations: {
						where: (translations, {
							eq,
							or,
						}) => or(
							eq(translations.iso6391, language),
							isNull(translations.iso6391)
						),
					},
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
						columns: {
							movie_id: true,
						},
						with: {
							certification: {
								// columns: {
								// 	rating: true,
								// 	iso31661: true,
								// },
							},
						},
					},
					userData: {
						where: (userData, { eq }) => eq(userData.user_id, user_id),
					},
				},
				orderBy: asc(movies.title),
			});

			const response: LibraryResponseContent[] = [];

			for (const tv of TVS ?? []) {
				// const title = tv.translations.find(t => t.tv_id == tv.id)?.title || tv.title;
				const title = tv.title;
				const overview = tv.translations.find(t => t.tv_id == tv.id)?.overview || tv.overview;
				const logo = tv.images.sort((a, b) => (b.voteAverage && a.voteAverage
					?					(b.voteAverage - a.voteAverage)
					:					-1))
					.find(m => m.type == 'logo');

				const palette = JSON.parse(tv.colorPalette ?? '{}');

				response.push({
					id: tv.id,
					backdrop: tv.backdrop,
					favorite: tv.userData.find(i => i.tv_id == tv.id)?.isFavorite == 1 ?? false,
					watched: tv.userData.find(i => i.tv_id == tv.id)?.played == 1 ?? false,
					logo: logo?.filePath ?? null,
					mediaType: 'tv',
					numberOfEpisodes: tv.numberOfEpisodes ?? 1,
					haveEpisodes: tv.haveEpisodes ?? 0,
					overview: overview,
					color_palette: {
						logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
						poster: palette?.poster ?? null,
						backdrop: palette?.backdrop ?? null,
					},
					poster: tv.poster,
					title: title[0].toUpperCase() + title.slice(1),
					titleSort: tv.titleSort,
					type: 'tv',
					year: parseYear(tv.firstAirDate),
					genres: tv.genre_tv?.map(g => ({
						id: g.genre_id,
						item_id: g.tv_id,
						name: g.genre.name,
					})) ?? [],
					rating: getClosestRating(tv.certification_tv, language)?.certification,
					videoId: tv.medias?.at(0)?.src,
					videos: tv.medias?.map((v) => {
						return {
							src: v.src,
							type: v.type!,
							name: v.name!,
							site: v.site!,
							size: v.size!,
						};
					})
						.sort((a, b) => a.size - b.size)
						.sort(<T extends { type: string }>(a: T, b: T) => {
							return (priority as any)[a.type] - (priority as any)[b.type];
						}),
				});
			}
			for (const movie of MOVIES ?? []) {
				// const title = movie.translations.find(t => t.movie_id == movie.id)?.title || movie.title;
				const title = movie.title;
				const overview
					= movie.translations.find(t => t.movie_id == movie.id)?.overview || movie.overview;

				const logo = movie.images.sort((a, b) => (b.voteAverage && a.voteAverage
					?					(b.voteAverage - a.voteAverage)
					:					-1))
					.find(m => m.type == 'logo');

				const palette = JSON.parse(movie.colorPalette ?? '{}');

				response.push({
					id: movie.id,
					backdrop: movie.backdrop,
					favorite: movie.userData.find(i => i.movie_id == movie.id)?.isFavorite == 1 ?? false,
					watched: movie.userData.find(i => i.movie_id == movie.id)?.played == 1 ?? false,
					logo: logo?.filePath ?? null,
					mediaType: 'movie',
					overview: overview,
					color_palette: {
						logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
						poster: palette?.poster ?? null,
						backdrop: palette?.backdrop ?? null,
					},
					poster: movie.poster,
					title: title[0].toUpperCase() + title.slice(1),
					titleSort: movie.titleSort,
					type: 'movie',
					year: parseYear(movie.releaseDate),
					genres: movie.genre_movie?.map(g => ({
						id: g.genre_id,
						item_id: g.movie_id,
						name: g.genre.name,
					})) ?? [],
					rating: getClosestRating(movie.certification_movie, language)?.certification,
					videoId: movie.medias?.at(0)?.src,
					videos: movie.medias?.map((v) => {
						return {
							src: v.src,
							type: v.type!,
							name: v.name!,
							site: v.site!,
							size: v.size!,
						};
					})
						.sort((a, b) => a.size - b.size)
						.sort(<T extends { type: string }>(a: T, b: T) => {
							return (priority as any)[a.type] - (priority as any)[b.type];
						}),
				});
			}

			return resolve(response.sort((a, b) => a.titleSort.localeCompare(b.titleSort)));
		} catch (error) {
			console.log(error);
		}
	});

};

// interface Content {
// 	tvs: (Tv & {
// 		images: {
// 			type: string | null;
// 			color_palette: string | null;
// 			filePath: string;
// 			voteAverage: number | null;
// 		}[];
// 		medias: {
// 			type: string | null;
// 			src: string | null;
// 		}[];
// 		translations: Translation[];
// 		genre_tv: {
// 			tv_id: number;
// 			genre_id: number;
// 			genre: {
// 				id: number;
// 				name: string | null;
// 			};
// 		}[];
// 		certification_tv: {
// 			certification: {
// 				iso31661: string;
// 				rating: string;
// 			};
// 		}[];
// 	})[];
// 	movies: (Movie & {
// 		images: {
// 			type: string | null;
// 			color_palette: string | null;
// 			filePath: string;
// 			voteAverage: number | null;
// 		}[];
// 		medias: {
// 			type: string | null;
// 			src: string | null;
// 		}[];
// 		translations: Translation[];
// 		genre_movie: {
// 			movie_id: number;
// 			genre_id: number;
// 			genre: {
// 				id: number;
// 				name: string | null;
// 			};
// 		}[];
// 		certification_movie: {
// 			certification: {
// 				iso31661: string;
// 				rating: string;
// 			};
// 		}[];
// 	})[];
// }
