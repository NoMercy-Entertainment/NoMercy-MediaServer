/* eslint-disable indent */

import { getFromDepartmentMap, imageMap, peopleMap, relatedMap } from '../helpers';
import { Request, Response } from 'express';

import { InfoResponse } from '../../../types/server';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { groupBy } from '@server/functions/stringArray';
import { movie } from '../../../providers/tmdb/movie';
import { MovieWithRelations, getMovie } from '@server/db/media/actions/movies';
import { requestWorker } from '@server/api/requestWorker';
import i18n from '@server/loaders/i18n';

export default async function (req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		id: req.params.id,
		language: req.language,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500).json({
			status: 'error',
			message: result.error.message,
		});
	}
	return res.json(result.result);
}

export const exec = ({ id, user_id, language }: { id: string; user_id: string; language: string }) => {
	return new Promise(async (resolve, reject) => {

		const movie = getMovie({ id: parseInt(id, 10), user_id, language });
		if (!movie) {
			resolve(await getMovieData(id));
		}
		resolve(getContent(movie));
	});
};

const getContent = (data: MovieWithRelations) => {
	if (!data) return;

	const groupedMedia = groupBy(data.images, 'type');

	const title = data.translations[0]?.title || data.title;
	const overview = data.translations[0]?.overview || data.overview;

	const logos = imageMap(groupedMedia.logo);
	const palette = JSON.parse(data.colorPalette ?? '{}');

	const response: InfoResponse = {
		id: data.id,
		title: title,
		overview: overview,
		poster: data.poster,
		backdrop: data.backdrop,
		logo: logos[0]?.src ?? null,
		colorPalette: {
			logo: logos[0]?.colorPalette,
			poster: palette?.poster ?? null,
			backdrop: palette?.backdrop ?? null,
		},
		videos: data.medias?.map((v) => {
			return {
				src: v.src,
				type: v.type!,
				name: v.name!,
				site: v.site!,
			};
		}) ?? [],
		backdrops: imageMap(groupedMedia.backdrop),
		posters: imageMap(groupedMedia.poster),
		logos: logos,
		similar: relatedMap(data.similar_from, 'movie'),
		recommendations: relatedMap(data.recommendation_from, 'movie'),
		cast: peopleMap(data.casts, 'roles'),
		crew: peopleMap(data.crews, 'jobs'),
		contentRatings: data.certification_movie.map((r) => {
			return {
				rating: r.certification.rating,
				// meaning: r.certification.meaning,
				// order: r.certification.order,
				iso31661: r.certification.iso31661,
			};
		}),
		titleSort: data.titleSort,
		duration: data.runtime,
		year: new Date(Date.parse(data.releaseDate as string ?? '')).getFullYear(),
		voteAverage: data.voteAverage,
		watched: data.userData?.[0]?.played == 1 ?? false,
		favorite: data.userData?.[0]?.isFavorite == 1 ?? false,
		externalIds: {
			imdbId: data.imdbId,
			tvdbId: data.tvdbId,
		},
		creators: [],
		directors: getFromDepartmentMap(data.crews, 'job', 'Director'),
		writers: getFromDepartmentMap(data.crews, 'job', 'Writer'),
		director: getFromDepartmentMap(data.crews, 'job', 'Director'),

		genres: data.genre_movie.map(g => ({
			id: g.genre.id,
			name: g.genre.name ?? '',
		})) ?? [],
		keywords: data.keyword_movie.map(c => c.keyword.name),
		type: 'movie',
		mediaType: 'movie',
		seasons: [],
	};

	return response;
};

const getMovieData = async (id: string) => {

	i18n.changeLanguage('en');

	const data = await movie(parseInt(id, 10));

	const similar: any = [];
	const recommendations: any = [];

	for (const s of data.similar.results) {
		const index = data.similar.results.indexOf(s);
		similar.push({
			...s,
			backdrop: s.backdrop_path,
			poster: s.poster_path,
			mediaType: 'movie',
			// blurHash: {
			// 	poster: index < 10 && s.poster_path
			// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.poster_path}`)
			// 		: null,
			// 	backdrop: index < 10 && s.backdrop_path
			// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.backdrop_path}`)
			// 		: null,
			// },
		});
	}

	for (const s of data.recommendations.results) {
		const index = data.recommendations.results.indexOf(s);
		recommendations.push({
			...s,
			backdrop: s.backdrop_path,
			poster: s.poster_path,
			mediaType: 'movie',
			// blurHash: {
			// 	poster: index < 10 && s.poster_path
			// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.poster_path}`)
			// 		: null,
			// 	backdrop: index < 10 && s.backdrop_path
			// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.backdrop_path}`)
			// 		: null,
			// },
		});
	}

	const ratings: any = [];

	for (const rating of data?.release_dates?.results ?? []) {

		for (const rate of rating.release_dates) {

			ratings.push({
				rating: rate.certification,
				meaning: rate.note,
				iso31661: rating.iso_3166_1,
			});
		}
	}

	const response: InfoResponse = {
		id: data.id,
		title: data.title,
		overview: data.overview,
		poster: data.poster_path,
		backdrop: data.backdrop_path,
		logo: data.images.logos[0]?.file_path ?? null,
		// blurHash: {
		// 	logo: data.images.logos[0]?.file_path
		// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${data.images.logos[0].file_path}`)
		// 		: null,
		// 	poster: data?.poster_path
		// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${data?.poster_path}`)
		// 		: null,
		// 	backdrop: data?.backdrop_path
		// 		? await createBlurHash(`https://image.tmdb.org/t/p/w185${data?.backdrop_path}`)
		// 		: null,
		// },
		videos: data.videos.results?.map((v) => {
			return {
				src: v.key,
				name: v.name,
				type: v.type,
				site: v.site,
			};
		}) ?? [],
		backdrops: imageMap(data.images.backdrops),
		logos: imageMap(data.images.logos),
		posters: imageMap(data.images.posters),
		contentRatings: ratings,
		watched: false,
		favorite: false,
		titleSort: createTitleSort(data.title),
		duration: data.runtime,
		year: new Date(Date.parse(data.release_date!)).getFullYear(),
		voteAverage: data.vote_average,
		similar: similar as InfoResponse['similar'],
		recommendations: recommendations as InfoResponse['recommendations'],
		externalIds: {
			imdbId: data.external_ids.imdb_id as string | null,
			tvdbId: data.external_ids.tvdb_id as number | null,
		},
		creators: data.credits.crew.filter(c => c.department == 'Directing'),
		directors: data.credits.crew.filter(c => c.department == 'Directing')
			.slice(0, 10)
			.map(c => ({
				id: c.id,
				name: c.name,
			})) ?? [],
		writers: data.credits.crew.filter(c => c.department == 'Writing')
			.slice(0, 10)
			.map(c => ({
				id: c.id,
				name: c.name,
			})) ?? [],
		genres: data.genres.map(g => ({
			id: g.id,
			name: g.name,
		})) ?? [],
		keywords: data.keywords.keywords.map(c => c.name),
		type: 'movie',
		mediaType: 'movie',
		cast: data.credits.cast.map((c) => {
			return {
				gender: c.gender,
				id: c.id,
				creditId: c.credit_id,
				character: c.character,
				knownForDepartment: c.known_for_department,
				name: c.name,
				profilePath: c.profile_path,
				popularity: c.popularity,
				deathday: null,
				// blurHash: c.blurHash,
			};
		}),
		crew: data.credits.crew.map((c) => {
			return {
				gender: c.gender,
				id: c.id,
				creditId: c.credit_id,
				job: c.job,
				department: c.department,
				knownForDepartment: c.known_for_department,
				name: c.name,
				profilePath: c.profile_path,
				popularity: c.popularity,
				deathday: null,
				// blurHash: c.blurHash,
			};
		}),
		director: data.credits.crew.filter(c => c.department == 'Directing')
			.map(c => ({
				id: c.id,
				name: c.name,
				// blurHash: c.blurHash,
			})),
		seasons: [],
	};

	return response;

};
