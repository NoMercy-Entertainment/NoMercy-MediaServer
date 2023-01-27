import {
	AlternativeTitles,
	Cast,
	CastMovie,
	Certification,
	CertificationMovie,
	CollectionMovie,
	Crew,
	CrewMovie,
	Genre,
	GenreMovie,
	Image,
	Keyword,
	KeywordMovie,
	Library,
	Media,
	Movie,
	Person,
	Prisma,
	Recommendation,
	Similar,
	SpecialItem,
	UserData,
	VideoFile
} from '@prisma/client';
import { ExtendedVideo, InfoResponse, MediaItem } from '../../../types/server';
import { Request, Response } from 'express';

import { KAuthRequest } from '../../../types/keycloak';
import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';
import createBlurHash from '../../../functions/createBlurHash';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { getLanguage } from '../../middleware';
import { groupBy } from '../../../functions/stringArray';
import i18next from 'i18next';
import { isOwner } from '../../middleware/permissions';
import { movie } from '../../../providers/tmdb/movie';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const recommendations: Recommendation[] = [];
	const similar: Similar[] = [];

	await Promise.all([
		confDb.recommendation.findMany({
			where: {
				recommendationableType: 'movie',
				recommendationableId: parseInt(req.params.id, 10),
				mediaId: {
					not: parseInt(req.params.id, 10),
				},
			},
		}).then(d => recommendations.push(...d.map(m => ({ ...m, mediaType: 'movies', id: m.mediaId })))),

		confDb.similar.findMany({
			where: {
				similarableType: 'movie',
				similarableId: parseInt(req.params.id, 10),
				mediaId: {
					not: parseInt(req.params.id, 10),
				},
			},
		}).then(d => similar.push(...d.map(m => ({ ...m, mediaType: 'movies', id: m.mediaId })))),
	]);

	if (owner) {
		confDb.movie
			.findFirst(ownerQuery(req.params.id))
			.then(async (movie) => {
				if (!movie) {
					return res.json(await getMovieData(req.params.id));
				}
				return res.json(await getContent(movie, language, similar, recommendations, servers));
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
				return res.json(await getContent(movie, language, similar, recommendations, servers));
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

type MovieWithInfo = Movie & {
	AlternativeTitles: AlternativeTitles[];
	Cast: (CastMovie & {
		Cast: Cast & {
			Person: Person | null;
		};
	})[];
	CollectionMovie: (CollectionMovie & {
		Movie: Movie;
	})[];
	Crew: (CrewMovie & {
		Crew: Crew & {
			Person: Person | null;
		};
	})[];
	Certification: (CertificationMovie & {
		Certification: Certification;
	})[];
	Genre: (GenreMovie & {
		Genre: Genre;
	})[];
	Keyword: (KeywordMovie & {
		Keyword: Keyword;
	})[];
	SpecialItem: SpecialItem[];
	VideoFile: VideoFile[];
	Library: Library;
	Media: Media[];
	UserData: UserData[];
};

const getContent = async (
	data: MovieWithInfo,
	language: string,
	similar: Similar[],
	recommendations: Recommendation[],
	servers: string[]
): Promise<InfoResponse> => {
	const translations: any[] = [];
	await confDb.translation.findMany(translationQuery({ id: data.id, language })).then(data => translations.push(...data));

	const groupedMedia = groupBy(data.Media, 'type');

	const title = translations.find(t => t.translationableType == 'movie' && t.translationableId == data.id)?.title || data.title;
	const overview = translations.find(t => t.translationableType == 'movie' && t.translationableId == data.id)?.overview || data.overview;

	const logos = groupedMedia.logo?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [];
	const hash = JSON.parse(data.blurHash ?? '{}');

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
		videos: groupedMedia.Trailer ?? [],
		backdrops: groupedMedia.backdrop?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [],
		logos: logos,
		posters: groupedMedia.poster?.map((i: Image) => ({ ...i, colorPalette: JSON.parse(i.colorPalette ?? '{}') })) ?? [],
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
		similar: similar.map(s => ({ ...s, blurHash: JSON.parse(s.blurHash ?? '') })),
		recommendations: recommendations.map(s => ({ ...s, blurHash: JSON.parse(s.blurHash ?? '') })),
		externalIds: {
			imdbId: data.imdbId,
			tvdbId: data.tvdbId,
		},
		creators: [],
		directors:
			data.Crew.filter(c => c.Crew.department == 'Directing')
				.slice(0, 10)
				.map(c => ({
					id: c.Crew.personId,
					name: c.Crew.name,
				})) ?? [],
		writers:
			data.Crew.filter(c => c.Crew.department == 'Writing')
				.slice(0, 10)
				.map(c => ({
					id: c.Crew.personId,
					name: c.Crew.name,
				})) ?? [],

		genres:
			data.Genre.map(g => ({
				id: g.Genre.id,
				name: g.Genre.name,
			})) ?? [],
		keywords: data.Keyword.map(c => c.Keyword.name),
		type: 'movies',
		mediaType: 'movies',
		cast: data.Cast.map(c => c.Cast).map((c) => {
			return {
				gender: c.gender,
				id: c.personId,
				creditId: c.creditId,
				character: c.character,
				knownForDepartment: c.knownForDepartment,
				name: c.name,
				profilePath: c.profilePath,
				popularity: c.popularity,
				deathday: c.Person?.deathday,
				blurHash: c.blurHash,
			};
		}),
		crew: data.Crew.map(c => c.Crew).map((c) => {
			return {
				gender: c.gender,
				id: c.personId,
				creditId: c.creditId,
				job: c.job,
				department: c.department,
				knownForDepartment: c.knownForDepartment,
				name: c.name,
				profilePath: c.profilePath,
				popularity: c.popularity,
				deathday: c.Person?.deathday,
				blurHash: c.blurHash,
			};
		}),
		director: data.Crew.filter(c => c.Crew.department == 'Directing')
			.map(c => c.Crew)
			.map(c => ({
				id: c.personId,
				name: c.name,
				blurHash: c.blurHash,
			})),
	};

	return response;
};

const translationQuery = ({ id, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			translationableId: id,
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
			CollectionMovie: {
				include: {
					Movie: true,
				},
			},
			Cast: {
				include: {
					Cast: {
						include: {
							Person: true,
						},
					},
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			Crew: {
				include: {
					Crew: {
						include: {
							Person: true,
						},
					},
				},
			},
			Genre: {
				include: {
					Genre: true,
				},
			},
			SpecialItem: true,
			VideoFile: true,
			Keyword: {
				include: {
					Keyword: true,
				},
			},
			Library: true,
			Media: {
				where: {
					OR: [
						{
							iso6391: null,
						},
						{
							iso6391: 'en',
							type: {
								not: null,
							},
						},
					],
				},
				orderBy: {
					voteAverage: 'desc',
				},
			},
			UserData: true,
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
			CollectionMovie: {
				include: {
					Movie: true,
				},
			},
			Cast: {
				include: {
					Cast: {
						include: {
							Person: true,
						},
					},
				},
			},
			Certification: {
				include: {
					Certification: true,
				},
			},
			Crew: {
				include: {
					Crew: {
						include: {
							Person: true,
						},
					},
				},
			},
			Genre: {
				include: {
					Genre: true,
				},
			},
			SpecialItem: true,
			VideoFile: true,
			Keyword: {
				include: {
					Keyword: true,
				},
			},
			Library: true,
			Media: {
				where: {
					OR: [
						{
							iso6391: null,
						},
						{
							iso6391: 'en',
							type: {
								not: null,
							},
						},
					],
				},
				orderBy: {
					voteAverage: 'desc',
				},
			},
			UserData: true,
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
			mediaType: 'movies',
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
			mediaType: 'movies',
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
		videos: data.videos.results.map(v => ({ ...v, src: v.key })) as unknown as ExtendedVideo[],
		backdrops: data.images.backdrops as unknown as MediaItem[],
		logos: data.images.logos as unknown as MediaItem[],
		posters: data.images.posters as unknown as MediaItem[],
		contentRatings: ratings,
		watched: false,
		favorite: false,
		titleSort: createTitleSort(data.title),
		duration: data.runtime,
		year: new Date(Date.parse(data.release_date!)).getFullYear(),
		voteAverage: data.vote_average,
		similar: similar as unknown as Similar[],
		recommendations: recommendations as unknown as Recommendation[],
		externalIds: {
			imdbId: data.external_ids.imdb_id as string | null,
			tvdbId: data.external_ids.tvdb_id as number | null,
		},
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
		keywords: data.keywords.keywords.map(c => c.name),
		type: 'movies',
		mediaType: 'movies',
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
	};

	return response;

};
