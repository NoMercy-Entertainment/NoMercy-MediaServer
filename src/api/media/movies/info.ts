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
	VideoFile,
} from '@prisma/client'
import { Request, Response } from 'express';

import { InfoResponse } from 'types/server';
import { KAuthRequest } from 'types/keycloak';
import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';
import { deviceId } from '../../../functions/system';
import { groupBy } from '../../../functions/stringArray';
import { isOwner } from '../../middlewares/permissions';

export default async function (req: Request, res: Response) {
	const language = req.acceptsLanguages()[0] != 'undefined' ? req.acceptsLanguages()[0].split('-')[0] : 'en';

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
				}
			}
		}).then(d => recommendations.push(...d.map(m => ({...m, mediaType: 'movies', id: m.mediaId})))),

		confDb.similar.findMany({
			where: {
				similarableType: 'movie',
				similarableId: parseInt(req.params.id, 10),
				mediaId: {
					not: parseInt(req.params.id, 10),
				}
			}
		}).then(d => similar.push(...d.map(m => ({...m, mediaType: 'movies', id: m.mediaId})))),
	]);

	if (owner) {
		confDb.movie
			.findFirst(ownerQuery(req.params.id, language))
			.then(async (movie) => {
				if (!movie) {
					return res.json({
						status: 'ok',
						message: `Something went wrong getting library`,
					});
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
			.findFirst(userQuery(req.params.id, user, language))
			.then(async (movie) => {
				if (!movie) {
					return res.json({
						status: 'ok',
						message: `Something went wrong getting library`,
					});
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

const getContent = async (data: MovieWithInfo, language: string, similar: Similar[], recommendations: Recommendation[], servers: string[]): Promise<InfoResponse> => {
	const translations: any[] = [];
	await confDb.translation.findMany(translationQuery({ id: data.id, language })).then((data) => translations.push(...data));

	const groupedMedia = groupBy(data.Media, 'type');

	const title = translations.find((t) => t.translationableType == 'movie' && t.translationableId == data.id)?.title || data.title;
	const overview = translations.find((t) => t.translationableType == 'movie' && t.translationableId == data.id)?.overview || data.overview;

	const response: InfoResponse = {
		id: data.id,
		title: title,
		overview: overview,
		poster: data.poster,
		backdrop: data.backdrop,
		videos: groupedMedia.Trailer ?? [],
		backdrops: groupedMedia.backdrop?.map((i: Image) => ({...i, colorPalette: JSON.parse(i.colorPalette ?? "{}")})) ?? [],
		logos: groupedMedia.logo?.map((i: Image) => ({...i, colorPalette: JSON.parse(i.colorPalette ?? "{}")})) ?? [],
		posters: groupedMedia.poster?.map((i: Image) => ({...i, colorPalette: JSON.parse(i.colorPalette ?? "{}")})) ?? [],
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
		similar: similar,
		recommendations: recommendations,
		externalIds: {
			imdbId: data.imdbId,
			tvdbId: data.tvdbId,
		},
		creators: [],
		directors:
			data.Crew.filter((c) => c.Crew.department == 'Directing')
				.slice(0, 10)
				.map((c) => ({
					id: c.Crew.personId,
					name: c.Crew.name,
				})) ?? [],
		writers:
			data.Crew.filter((c) => c.Crew.department == 'Writing')
				.slice(0, 10)
				.map((c) => ({
					id: c.Crew.personId,
					name: c.Crew.name,
				})) ?? [],

		genres:
			data.Genre.map((g) => ({
				id: g.Genre.id,
				name: g.Genre.name,
			})) ?? [],
		keywords: data.Keyword.map((c) => c.Keyword.name),
		type: data.Library.type == 'tv' ? 'tv' : 'movies',
		mediaType: data.Library.type == 'tv' ? 'tv' : 'movies',
		cast: data.Cast.map((c) => c.Cast).map((c) => {
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
			};
		}),
		crew: data.Crew.map((c) => c.Crew).map((c) => {
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
			};
		}),
		director: data.Crew.filter((c) => c.Crew.department == 'Directing')
			.map((c) => c.Crew)
			.map((c) => ({ 
				id: c.personId, 
				name: c.name 
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

const ownerQuery = (id: string, language: string) => {
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
						}
					]
				},
				orderBy: {
					voteAverage: 'desc',
				}
			},
			UserData: true,
		},
	});
};

const userQuery = (id: string, userId: string, language: string) => {
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
						}
					]
				},
				orderBy: {
					voteAverage: 'desc',
				}
			},
			UserData: true,
		},
	});
};
