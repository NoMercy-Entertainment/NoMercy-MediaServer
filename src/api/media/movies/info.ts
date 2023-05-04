/* eslint-disable indent */

import { Image, Prisma } from '../../../database/config/client';
import { MovieWithInfo, getFromDepartmentMap, imageMap, peopleMap, relatedMap } from '../helpers';
import { Request, Response } from 'express';

import { InfoResponse } from '../../../types/server';
import { KAuthRequest } from '../../../types/keycloak';
import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';
import createBlurHash from '../../../functions/createBlurHash';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { getLanguage } from '../../middleware';
import { groupBy } from '../../../functions/stringArray';
import i18next from 'i18next';
import { isOwner } from '../../middleware/permissions';
import { movie } from '../../../providers/tmdb/movie';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	if (owner) {
		confDb.movie
			.findFirst(ownerQuery(req.params.id))
			.then(async (movie) => {
				if (!movie) {
					return res.json(await getMovieData(req.params.id));
				}
				return res.json(await getContent(movie, language));
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting library: ${error}`,
				});
				return res.status(404).json({
					status: 'error',
					message: `Something went wrong getting library: ${error}`,
				});
			});
	} else {
		confDb.movie
			.findFirst(userQuery(req.params.id, user))
			.then(async (movie) => {
				if (!movie) {
					return res.json(await getMovieData(req.params.id));
				}
				return res.json(await getContent(movie, language));
			})
			.catch((error) => {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Error getting library: ${error}`,
				});
				return res.status(404).json({
					status: 'error',
					message: `Something went wrong getting library: ${error}`,
				});
			});
	}

}

const getContent = async (
	data: MovieWithInfo,
	language: string
): Promise<InfoResponse> => {
	const translations: any[] = [];

	await confDb.translation.findMany(translationQuery({ id: data.id, language }))
		.then(data => translations.push(...data));

	const groupedMedia = groupBy(data.Media, 'type');

	const title = translations.find(t => t.movieId == data.id)?.title || data.title;
	const overview = translations.find(t => t.movieId == data.id)?.overview || data.overview;

	const logos = groupedMedia.logo?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [];
	const palette = JSON.parse(data.colorPalette ?? '{}');

	const response: InfoResponse = {
		id: data.id,
		title: title,
		overview: overview,
		poster: data.poster,
		backdrop: data.backdrop,
		colorPalette: {
			logo: logos[0]?.colorPalette,
			poster: palette?.poster ?? null,
			backdrop: palette?.backdrop ?? null,
		},
		videos: groupedMedia.Trailer?.map((v) => {
			return {
				src: v.src,
				name: v.name,
				type: v.type,
				site: v.site,
			};
		}) ?? [],
		backdrops: await imageMap(groupedMedia.backdrop),
		posters: await imageMap(groupedMedia.poster),
		logos: logos,
		similar: relatedMap(data.SimilarFrom, 'movie'),
		recommendations: relatedMap(data.RecommendationFrom, 'movie'),
		cast: peopleMap(data.Cast, 'Roles'),
		crew: peopleMap(data.Crew, 'Jobs'),
		contentRatings: data.Certification.map((r) => {
			return {
				rating: r.Certification.rating,
				meaning: r.Certification.meaning,
				order: r.Certification.order,
				iso31661: r.Certification.iso31661,
			};
		}),
		titleSort: data.titleSort,
		duration: data.runtime,
		year: new Date(Date.parse(data.releaseDate!)).getFullYear(),
		voteAverage: data.voteAverage,
		watched: data.UserData?.[0]?.played ?? false,
		favorite: data.UserData?.[0]?.isFavorite ?? false,
		externalIds: {
			imdbId: data.imdbId,
			tvdbId: data.tvdbId,
		},
		creators: [],
		directors: getFromDepartmentMap(data.Crew, 'job', 'Director'),
		writers: getFromDepartmentMap(data.Crew, 'job', 'Writer'),
		director: getFromDepartmentMap(data.Crew, 'job', 'Director'),

		genres: data.Genre.map(g => ({
			id: g.Genre.id,
			name: g.Genre.name,
		})) ?? [],
		keywords: data.Keyword.map(c => c.Keyword.name),
		type: 'movies',
		mediaType: 'movie',
		seasons: [],
	};

	return response;
};

const translationQuery = ({ id, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			movieId: id,
			iso6391: language,
		},
	});
};

const ownerQuery = (id: string) => {
	return Prisma.validator<Prisma.MovieFindFirstArgsBase>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			AlternativeTitles: true,
			Cast: {
				include: {
					Image: true,
					Person: true,
					Roles: true,
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			CollectionFrom: {
				include: {
					Movie: true,
				},
			},
			Crew: {
				include: {
					Jobs: true,
					Person: true,
				},
			},
			Genre: {
				include: {
					Genre: true,
				},
			},
			Keyword: {
				include: {
					Keyword: true,
				},
			},
			Library: true,
			Media: {
				orderBy: {
					voteAverage: 'desc',
				},
				where: {
					OR: [
						{
							iso6391: 'en',
							type: {
								not: null,
							},
						},
						{
							iso6391: null,
						},
					],
				},
			},
			RecommendationFrom: {
				include: {
					MovieTo: true,
				},
			},
			SimilarFrom: {
				include: {
					MovieTo: true,
				},
			},
			SpecialItem: true,
			UserData: true,
			VideoFile: true,
		},
	});
};

const userQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.MovieFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
			Library: {
				User: {
					some: {
						userId: userId,
					},
				},
			},
		},
		include: {
			AlternativeTitles: true,
			Cast: {
				include: {
					Image: true,
					Person: true,
					Roles: true,
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			CollectionFrom: {
				include: {
					Movie: true,
				},
			},
			Crew: {
				include: {
					Jobs: true,
					Person: true,
				},
			},
			Genre: {
				include: {
					Genre: true,
				},
			},
			Keyword: {
				include: {
					Keyword: true,
				},
			},
			Library: true,
			Media: {
				orderBy: {
					voteAverage: 'desc',
				},
				where: {
					OR: [
						{
							iso6391: 'en',
							type: {
								not: null,
							},
						},
						{
							iso6391: null,
						},
					],
				},
			},
			RecommendationFrom: {
				include: {
					MovieTo: true,
				},
			},
			SimilarFrom: {
				include: {
					MovieTo: true,
				},
			},
			SpecialItem: true,
			UserData: true,
			VideoFile: true,
		},
	});
};

const getMovieData = async (id: string) => {

	i18next.changeLanguage('en');

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
			blurHash: {
				poster: index < 10 && s.poster_path
					? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.poster_path}`)
					: null,
				backdrop: index < 10 && s.backdrop_path
					? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.backdrop_path}`)
					: null,
			},
		});
	}

	for (const s of data.recommendations.results) {
		const index = data.recommendations.results.indexOf(s);
		recommendations.push({
			...s,
			backdrop: s.backdrop_path,
			poster: s.poster_path,
			mediaType: 'movie',
			blurHash: {
				poster: index < 10 && s.poster_path
					? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.poster_path}`)
					: null,
				backdrop: index < 10 && s.backdrop_path
					? await createBlurHash(`https://image.tmdb.org/t/p/w185${s.backdrop_path}`)
					: null,
			},
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
		blurHash: {
			logo: data.images.logos[0]?.file_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${data.images.logos[0].file_path}`)
				: null,
			poster: data?.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${data?.poster_path}`)
				: null,
			backdrop: data?.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${data?.backdrop_path}`)
				: null,
		},
		videos: data.videos.results?.map((v) => {
			return {
				src: v.key,
				name: v.name,
				type: v.type,
				site: v.site,
			};
		}) ?? [],
		backdrops: await imageMap(data.images.backdrops),
		logos: await imageMap(data.images.logos),
		posters: await imageMap(data.images.posters),
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
		type: 'movies',
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
