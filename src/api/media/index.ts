import { Request, Response } from 'express-serve-static-core';

import { parseYear } from '@server/functions/dateTime';
import { asc, inArray } from 'drizzle-orm';
import { genres } from '@server/db/media/schema/genres';
import { tvs } from '@server/db/media/schema/tvs';
import { getAllowedLibraries } from '@server/db/media/actions/libraries';
import { Movie } from '@server/db/media/actions/movies';
import { Tv } from '@server/db/media/actions/tvs';
import { requestWorker } from '../requestWorker';
import { episodes } from '@server/db/media/schema/episodes';
import { videoFiles } from '@server/db/media/schema/videoFiles';
import { getClosestRating } from '@server/functions/stringArray';
import { priority } from './helpers';

export default async function(req: Request, res: Response) {

	const allowedLibraries = getAllowedLibraries(req);

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		country: req.country,
		allowedLibraries: allowedLibraries,
		limit: req.body.limit,
		offset: req.body.page,
		take: req.body.take,
		page: req.body.page,
	});

	if (result.error) {
		return res.json({
			data: [],
		});
	}
	return res.json(result.result);
}

export const exec = ({
	allowedLibraries,
	language,
	limit,
	offset,
	take,
	page,
}:
	{ allowedLibraries: string[]; language: string; limit: number; offset: number; take: number; page: number }) => {
	return new Promise((resolve, reject) => {

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
				offset: offset || 0,
				orderBy: asc(genres.name),
				with: {
					genre_movie: true,
					genre_tv: true,
				},
			});

			const movieGids = genresResponse.map(g => g.genre_movie.map(m => m.movie_id))
				.flat()
				.concat(0);
			const moviesResponse = globalThis.mediaDb.query.movies.findMany({
				where: (movies, {
					sql,
					and,
				}) => and(
					sql`json_array_length(${movies.videoFiles}) > 0`,
					inArray(movies.id, movieGids)
				),
				with: {
					videoFiles: true,
					genre_movie: {
						with: {
							genre: true,
						},
					},
				},
			});

			const tvGids = genresResponse.map(g => g.genre_tv.map(t => t.tv_id))
				.flat()
				.concat(0);
			const tvsResponse = globalThis.mediaDb.query.tvs.findMany({
				where: inArray(tvs.id, tvGids),
				with: {
					genre_tv: {
						with: {
							genre: true,
						},
					},
				},
			});

			const translationsResponse = globalThis.mediaDb.query.translations.findMany({
				where: (translations, {
					eq,
					and,
					or,
				}) => or(
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
				where: (images, {
					eq,
					and,
					or,
				}) => or(
					and(
						eq(images.type, 'logo'),
						eq(images.iso6391, 'en'),
						inArray(images.tv_id, tvGids)
					),
					and(
						eq(images.type, 'logo'),
						eq(images.iso6391, 'en'),
						inArray(images.movie_id, movieGids)
					)
				),
			});

			const episodesResponse = globalThis.mediaDb.query.episodes.findMany({
				where: inArray(episodes.tv_id, tvGids),
				columns: {
					id: true,
					tv_id: true,
				},
			});

			const videoFilesResponse = globalThis.mediaDb.query.videoFiles.findMany({
				where: inArray(videoFiles.episode_id, episodesResponse.map(e => e.id)),
				columns: {
					episode_id: true,
					id: true,
					duration: true,
				},
			});

			const episodeVideoFiles = episodesResponse.map(e => ({
				id: e.id,
				tv_id: e.tv_id,
				videoFiles: videoFilesResponse.filter(v => v.episode_id == e.id),
			}));

			const mediasResponse = globalThis.mediaDb.query.medias.findMany({
				where: (medias, {
					eq,
					and,
					or,
				}) => or(
					and(
						eq(medias.type, 'Trailer'),
						inArray(medias.tv_id, tvGids)
					),
					and(
						eq(medias.type, 'Trailer'),
						inArray(medias.movie_id, movieGids)
					)
				),
			});

			const movieCertificationResponse = globalThis.mediaDb.query.certification_movie.findMany({
				where: (certification_movie, {
					or,
					and,
					eq,
				}) => or(
					and(
						inArray(certification_movie.movie_id, movieGids),
						eq(certification_movie.iso31661, 'NL')
					),
					and(
						inArray(certification_movie.movie_id, movieGids),
						eq(certification_movie.iso31661, 'US')
					)
				),
				with: {
					certification: true,
				},
			});

			const tvCertificationResponse = globalThis.mediaDb.query.certification_tv.findMany({
				where: certification_tv => inArray(certification_tv.tv_id, tvGids),
				with: {
					certification: true,
				},
			});

			const data = genresResponse.map((genre) => {
				const items = [
					...genre.genre_movie.map(m => ({
						...moviesResponse.find(mr => mr.id == m.movie_id),
						genres: moviesResponse.find(mr => mr.id == m.movie_id)?.genre_movie,
						certification: movieCertificationResponse.filter(c => c.movie_id == m.movie_id),
						medias: mediasResponse.filter(mr => mr.movie_id == m.movie_id),
						translations: translationsResponse.filter(tr => tr.movie_id == m.movie_id),
						images: imagesResponse.filter(ir => ir.movie_id == m.movie_id),
					}))
						.filter(t => t.videoFiles && t.videoFiles?.length > 0),

					...genre.genre_tv.map(t => ({
						...tvsResponse.find(tr => tr.id == t.tv_id),
						genres: tvsResponse.find(tr => tr.id == t.tv_id)?.genre_tv,
						certification: tvCertificationResponse.filter(c => c.tv_id == t.tv_id),
						medias: mediasResponse.filter(mr => mr.tv_id == t.tv_id),
						translations: translationsResponse.filter(tr => tr.tv_id == t.tv_id),
						images: imagesResponse.filter(ir => ir.tv_id == t.tv_id),
						videoFiles: episodeVideoFiles?.find(e => e.tv_id == t.tv_id)?.videoFiles,
					}))
						.filter(t => t.videoFiles && t.videoFiles?.length > 0),
				];

				return {
					id: genre.id,
					title: genre.name,
					moreLink: '',
					items: items.map((d) => {
						const type = (d as Tv).firstAirDate
							?							'tv'
							:							'movie';

						const logo = d.images?.find(m => m.type == 'logo');

						const palette = {
							...JSON.parse(d.colorPalette ?? '{}'),
							logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
						};

						const title = translationsResponse.find(t => t.tv_id == d.id)?.title || d.title;
						const overview = translationsResponse.find(t => t.tv_id == d.id)?.overview || d.overview;
						return {
							id: d.id,
							backdrop: d.backdrop,
							logo: imagesResponse.find(i => i.movie_id == d.id)?.filePath,
							title: title,
							overview: overview,
							poster: d.poster,
							titleSort: d.titleSort,
							type: type,
							year: parseYear((d as Tv).firstAirDate ?? (d as Movie).releaseDate),
							mediaType: type,
							color_palette: palette,
							genres: d.genres?.map(p => ({
								id: p?.genre.id,
								name: p?.genre.name,
								item_id: p?.movie_id ?? p?.tv_id,
							})) ?? [],
							rating: getClosestRating(d?.certification, language),
							videos: d.medias?.map((v) => {
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
						};
					})
						.sort(() => Math.random() - 0.5)
						.slice(0, 35),
				};
			});

			const nextId = data.length < take
				?				undefined
				:				data.length + page;

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
