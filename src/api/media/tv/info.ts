/* eslint-disable indent */

import { Request, Response } from 'express';
import i18next from 'i18next';

import { confDb } from '../../../database/config';
import { Prisma } from '../../../database/config/client';
import createBlurHash from '../../../functions/createBlurHash';
import { convertToSeconds } from '../../../functions/dateTime';
import Logger from '../../../functions/logger';
import { groupBy } from '../../../functions/stringArray';
import { tv as TV } from '../../../providers/tmdb/tv';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { KAuthRequest } from '../../../types/keycloak';
import { InfoResponse } from '../../../types/server';
import { getLanguage } from '../../middleware';
import { isOwner } from '../../middleware/permissions';
import { getFromDepartmentMap, imageMap, peopleMap, relatedMap, TvWithInfo } from '../helpers';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	if (owner) {
		confDb.tv
			.findFirst(ownerQuery(req.params.id, user))
			.then(async (tv) => {
				if (!tv) {
					return res.json(await getTvData(req.params.id));
					// return storeTvShow({ id: parseInt(req.params.id, 10), libraryId: '' });
				}
				return res.json(await getContent(tv, language));
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
		confDb.tv
			.findFirst(userQuery(req.params.id, user))
			.then(async (tv) => {
				if (!tv) {
					return res.json(await getTvData(req.params.id));
					// return storeTvShow({ id: parseInt(req.params.id, 10), libraryId: '' });
				}
				return res.json(await getContent(tv, language));
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
	data: TvWithInfo,
	language: string
	// similar: SimilarWithBase[],
	// recommendations: RecommendationsWithBase[]
): Promise<InfoResponse> => {
	const translations: any[] = [];
	await confDb.translation.findMany(translationQuery({ id: data.id, language })).then(data => translations.push(...data));

	const groupedMedia = groupBy(data.Media, 'type');

	const title = translations.find(t => t.ttvId == data.id)?.title || data.title;
	const overview = translations.find(t => t.ttvId == data.id)?.overview || data.overview;

	const files = [
		...data.Season.filter(t => t.seasonNumber > 0)
			.map(s => s.Episode.map(e => e.VideoFile).flat())
			.flat()
			.map(f => f.episodeId),
		// ...external?.find(t => t.id == tv.id && t.files)?.files ?? [],
	];
	// .filter((v, i, a) => a.indexOf(v) === i);

	const logos = await imageMap(groupedMedia.logo);
	const hash = JSON.parse(data.blurHash ?? '{}');

	// console.log(files);

	const response: InfoResponse = {
		id: data.id,
		title: title,
		overview: overview,
		poster: data.poster,
		backdrop: data.backdrop,
		blurHash: {
			logo: logos[0]?.blurHash ?? null,
			poster: hash?.poster ?? null,
			backdrop: hash?.backdrop ?? null,
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
		similar: relatedMap(data.SimilarFrom, 'tv'),
		recommendations: relatedMap(data.RecommendationFrom, 'tv'),
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
		watched: data.UserData?.[0]?.played ?? false,
		favorite: data.UserData?.[0]?.isFavorite ?? false,
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
			data.Creator?.filter(c => c?.Person?.name)
				?.slice(0, 10)
				?.map(c => ({
					id: c.Person!.id,
					name: c.Person!.name,
				})) ?? [],
		directors: getFromDepartmentMap(data.Crew, 'job', 'Director'),
		writers: getFromDepartmentMap(data.Crew, 'job', 'Writer'),
		director: getFromDepartmentMap(data.Crew, 'job', 'Director'),
		genres:
			data.Genre.map(g => ({
				id: g.Genre.id,
				name: g.Genre.name,
			})) ?? [],
		keywords: data.Keyword.map(c => c.Keyword.name),
		type: data.Library.type == 'tv'
			? 'tv'
			: 'movies',
		mediaType: data.Library.type == 'tv'
			? 'tv'
			: 'movies',
		seasons: data.Season.map((s) => {

			return {
				id: s.id,
				overview: s.overview,
				poster: s.poster,
				seasonNumber: s.seasonNumber,
				title: s.title,
				blurHash: s.blurHash,
				Episode: undefined,
				episodes: s.Episode.map((e) => {
					let progress: null | number = null;

					if (e.VideoFile[0] && e.VideoFile[0].duration && e.VideoFile[0]?.UserData?.[0]?.time) {
						progress = (e.VideoFile[0]?.UserData?.[0]?.time / convertToSeconds(e.VideoFile[0].duration) * 100);
					}

					return {
						id: e.id,
						episodeNumber: e.episodeNumber,
						seasonNumber: e.seasonNumber,
						title: e.title,
						overview: e.overview,
						airDate: e.airDate,
						still: e.still,
						blurHash: e.blurHash,
						progress: progress,
						available: !!e.VideoFile[0],
					};
				}),
			};
		}),
	};

	return response;
};

const translationQuery = ({ id, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			tvId: id,
			iso6391: language,
		},
	});
};

const ownerQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.TvFindFirstArgsBase>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			AlternativeTitles: true,
			Cast: {
				include: {
					Person: true,
					Image: true,
					Roles: {
						orderBy: {
							episodeCount: 'desc',
						},
					},
				},
				where: {
					Roles: {
						some: {
							episodeCount: {
								gt: 3,
							},
						},
					},
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			Creator: {
				include: {
					Person: true,
				},
			},
			Crew: {
				include: {
					Jobs: {
						orderBy: {
							episodeCount: 'desc',
						},
					},
					Person: true,
				},
				where: {
					Jobs: {
						some: {
							episodeCount: {
								gt: 3,
							},
						},
					},
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
					TvTo: true,
				},
			},
			Season: {
				include: {
					Episode: {
						include: {
							VideoFile: {
								include: {
									UserData: {
										where: {
											sub_id: userId,
										},
									},
								},
							},
						},
						orderBy: {
							episodeNumber: 'asc',
						},
					},
				},
				orderBy: {
					seasonNumber: 'asc',
				},
			},
			SimilarFrom: {
				include: {
					TvTo: true,
				},
			},
			UserData: true,
		},
	});
};

const userQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.TvFindFirstArgs>()({
		where: {
			OR: [
				{
					id: parseInt(id, 10),
					Library: {
						User: {
							some: {
								userId: userId,
							},
						},
					},
				},
				{
					id: parseInt(id, 10),
					Library: {
						is: null,
					},
				},
			],
		},
		include: {
			AlternativeTitles: true,
			Cast: {
				include: {
					Image: true,
					Person: true,
					Roles: {
						orderBy: {
							episodeCount: 'desc',
						},
					},
				},
				where: {
					Roles: {
						some: {
							episodeCount: {
								gt: 3,
							},
						},
					},
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			Creator: {
				include: {
					Person: true,
				},
			},
			Crew: {
				include: {
					Jobs: {
						orderBy: {
							episodeCount: 'desc',
						},
					},
					Person: true,
				},
				where: {
					Jobs: {
						some: {
							episodeCount: {
								gt: 3,
							},
						},
					},
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
					TvTo: true,
				},
			},
			Season: {
				include: {
					Episode: {
						include: {
							VideoFile: {
								include: {
									UserData: {
										where: {
											sub_id: userId,
										},
									},
								},
							},
						},
						orderBy: {
							episodeNumber: 'asc',
						},
					},
				},
				orderBy: {
					seasonNumber: 'asc',
				},
			},
			SimilarFrom: {
				include: {
					TvTo: true,
				},
			},
			UserData: true,
		},
	});
};

const getTvData = async (id: string) => {

	i18next.changeLanguage('en');

	const data = await TV(parseInt(id, 10));

	const similar: any = [];
	const recommendations: any = [];

	for (const s of data.similar.results) {
		const index = data.similar.results.indexOf(s);
		similar.push({
			...s,
			backdrop: s.backdrop_path,
			poster: s.poster_path,
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

	const response: InfoResponse = {
		id: data.id,
		title: data.name,
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
		// videos: data.videos.results.map(v => ({ ...v, src: v.key })) as unknown as ExtendedVideo[],
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
		// seasons: data.seasons.map((s) => {
		// 	return {
		// 		...s,
		// 		Episode: undefined,
		// 	};
		// }),
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

