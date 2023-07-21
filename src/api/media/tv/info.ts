/* eslint-disable indent */

import { Request, Response } from 'express';
import { getFromDepartmentMap, imageMap, peopleMap, relatedMap } from '../helpers';

import { InfoResponse } from '../../../types/server';
import { tv as TV } from '../../../providers/tmdb/tv';
// import createBlurHash from '@server/functions/createBlurHash';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import i18n from '@server/loaders/i18n';
import { TvWithRelations, getTv } from '@server/db/media/actions/tvs';
import { groupBy } from '@server/functions/stringArray';
import { convertToSeconds } from '@server/functions/dateTime';
import { requestWorker } from '@server/api/requestWorker';

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

		const tv = getTv({ id: parseInt(id, 10), user_id, language });

		if (!tv) {
			resolve(await getTvData(id));
		}
		resolve(getContent(tv));
	});
}

const getContent = (data: TvWithRelations) => {
	if (!data) return;

	const groupedMedia = groupBy(data.images, 'type');
	
	const title = data.translations[0]?.title || data.title;
	const overview = data.translations[0]?.overview || data.overview;

	const files = [
		...data.seasons.filter(t => t.seasonNumber > 0)
			.map(s => s.episodes.map(e => e.videoFiles).flat())
			.flat()
			.map(f => f.episode_id),
		// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
	];
	// .filter((v, i, a) => a.indexOf(v) === i);

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
		similar: relatedMap(data.similar_from, 'tv'),
		recommendations: relatedMap(data.recommendation_from, 'tv'),
		cast: peopleMap(data.casts, 'roles'),
		crew: peopleMap(data.crews, 'jobs'),
		contentRatings: data.certification_tv.map((r) => {
			return {
				rating: r.certification.rating,
				// meaning: r.certification.meaning,
				// order: r.certification.order,
				iso31661: r.certification.iso31661,
			};
		}),
		watched: data.userData?.[0]?.played == 1 ?? false,
		favorite: data.userData?.[0]?.isFavorite == 1 ?? false,
		titleSort: data.titleSort,
		duration: data.duration,
		numberOfEpisodes: data.numberOfEpisodes ?? 1,
		haveEpisodes: files.length,
		year: new Date(Date.parse(data.firstAirDate!)).getFullYear(),
		voteAverage: data.voteAverage,
		externalIds: {
			imdbId: data.imdbId,
			tvdbId: data.tvdbId,
		},
		creators:
			data.crews.filter(c => c.jobs.find(j => j.job === 'Creator'))?.filter(c => c?.person?.name)
				?.slice(0, 10)
				?.map(c => ({
					id: c.person!.id,
					name: c.person!.name,
				})) ?? [],
		directors: getFromDepartmentMap(data.crews, 'job', 'Director'),
		writers: getFromDepartmentMap(data.crews, 'job', 'Writer'),
		director: getFromDepartmentMap(data.crews, 'job', 'Director'),

		genres: data.genre_tv.map(g => ({
			id: g.genre.id,
			name: g.genre.name ?? '',
		})) ?? [],
		keywords: data.keyword_tv.map(c => c.keyword.name),
		type: data.library.type == 'tv'
			? 'tv'
			: 'movies',
		mediaType: data.library.type == 'tv'
			? 'tv'
			: 'movies',
		seasons: data.seasons.sort((a, b) => a.seasonNumber - b.seasonNumber).map((s) => {

			return {
				id: s.id,
				overview: s.overview,
				poster: s.poster,
				seasonNumber: s.seasonNumber,
				title: s.title,
				// blurHash: s.blurHash,
				colorPalette: JSON.parse(s.colorPalette ?? '{}'),
				episodes: s.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber).map((e) => {
					let progress: null | number = null;

					if (e.videoFiles[0] && e.videoFiles[0].duration && e.videoFiles[0]?.userData?.[0]?.time) {
						progress = (e.videoFiles[0]?.userData?.[0]?.time / convertToSeconds(e.videoFiles[0].duration) * 100);
					}

					return {
						id: e.id,
						episodeNumber: e.episodeNumber,
						seasonNumber: e.seasonNumber,
						title: e.title,
						overview: e.overview,
						airDate: e.airDate,
						still: e.still,
						// blurHash: e.blurHash,
						colorPalette: JSON.parse(e.colorPalette ?? '{}'),
						progress: progress,
						available: !!e.videoFiles[0],
					};
				}),
			};
		}),
	};

	return response;
};

const getTvData = async (id: string) => {

	i18n.changeLanguage('en');

	const data = await TV(parseInt(id, 10));

	const similar: any = [];
	const recommendations: any = [];

	for (const s of data.similar.results) {
		const index = data.similar.results.indexOf(s);
		similar.push({
			...s,
			backdrop: s.backdrop_path,
			poster: s.poster_path,
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

	const response: InfoResponse = {
		id: data.id,
		title: data.name,
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
		contentRatings: data.content_ratings.results.map((r) => {
			return {
				rating: r.rating,
				meaning: r.meaning,
				order: r.order,
				iso31661: r.iso_3166_1,
			};
		}),
		watched: false,
		favorite: false,
		titleSort: createTitleSort(data.name),
		duration: Math.round(data.episode_run_time.reduce((ert, c) => ert + c, 0) / data.episode_run_time.length),
		numberOfEpisodes: data.number_of_episodes,
		haveEpisodes: 0,
		year: new Date(Date.parse(data.first_air_date!)).getFullYear(),
		voteAverage: data.vote_average,
		similar: similar as InfoResponse['similar'],
		recommendations: recommendations as InfoResponse['recommendations'],
		externalIds: {
			imdbId: data.external_ids.imdb_id as string | null,
			tvdbId: data.external_ids.tvdb_id as number | null,
		},
		creators:
			data.created_by?.filter(c => c.name)
				.slice(0, 10)
				.map(c => ({
					id: c.id,
					name: c.name,
				})) ?? [],
		directors:
			data.credits.crew.filter(c => c.department == 'Directing')
				.slice(0, 10)
				.map(c => ({
					id: c.id,
					name: c.name,
				})) ?? [],
		writers:
			data.credits.crew.filter(c => c.department == 'Writing')
				.slice(0, 10)
				.map(c => ({
					id: c.id,
					name: c.name,
				})) ?? [],
		genres:
			data.genres.map(g => ({
				id: g.id,
				name: g.name,
			})) ?? [],
		keywords: data.keywords.results.map(c => c.name),
		type: 'tv',
		mediaType: 'tv',
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
			};
		}),
		director: data.credits.crew.filter(c => c.department == 'Directing')
			.map(c => ({
				id: c.id,
				name: c.name,
			})),
		seasons: data.seasons.map((s) => {
			return {
				id: s.id,
				overview: s.overview,
				poster: s.poster_path,
				seasonNumber: s.season_number,
				title: s.name,
				// blurHash: s.blurHash,
				Episode: undefined,
				episodes: [],
			};
		}),
	};

	return response;

};

