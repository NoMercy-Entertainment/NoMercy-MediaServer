/* eslint-disable indent */

import { Request, Response } from 'express';
import { KAuthRequest } from 'types/keycloak';

import { confDb } from '../../../database/config';
import {
	AlternativeTitles, Certification, CertificationMovie, Collection, CollectionMovie, Crew, Genre,
	GenreMovie, Keyword, KeywordMovie, Library, Media, Movie, Person, Prisma, SpecialItem, UserData,
	VideoFile
} from '../../../database/config/client';
import Logger from '../../../functions/logger';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { getLanguage } from '../../middleware';
import { isOwner } from '../../middleware/permissions';

export default function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	if (owner) {
		confDb.collection
			.findFirst(ownerQuery(req.params.id))
			.then(async (collection) => {
				if (!collection) {
					return res.json({
						status: 'error',
						message: 'Something went wrong getting library',
					});
				}
				return res.json(await getContent(collection, language));
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
		confDb.collection
			.findFirst(userQuery(req.params.id, user))
			.then(async (collection) => {
				if (!collection) {
					return res.json({
						status: 'error',
						message: 'Something went wrong getting library',
					});
				}
				return res.json(await getContent(collection, language));
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

type MovieWithInfo = (Collection & {
    Parts: (CollectionMovie & {
        Movie: (Movie & {
            Library: Library;
            AlternativeTitles: AlternativeTitles[];
            Cast: any[];
            Crew: (Crew & {
                Person: Person | null;
            })[];
            Certification: (CertificationMovie & {
                Certification: Certification;
            })[];
            Genre: (GenreMovie & {
                Genre: Genre;
            })[];
            SpecialItem: SpecialItem[];
            VideoFile: VideoFile[];
            Keyword: (KeywordMovie & {
                Keyword: Keyword;
            })[];
            Media: Media[];
            UserData: UserData[];
            CollectionTo: (CollectionMovie & {
                Movie: Movie | null;
            })[];
        }) | null;
    })[];
});

const getContent = async (data: MovieWithInfo, language: string) => {
	const translations: any[] = [];
	await confDb.translation.findMany(translationQuery({ id: data.id, language })).then(data => translations.push(...data));

	const title = translations.find(t => t.movieId == data.id)?.title || data.title;
	const overview = translations.find(t => t.movieId == data.id)?.overview || data.overview;

	const userData = data.Parts[0].Movie?.UserData[0];

	const response = {
		id: data.id,
		overview: overview,
		backdrop: data.backdrop,
		poster: data.poster,
		title: title[0].toUpperCase() + title.slice(1),
		titleSort: createTitleSort(title),
		type: 'movie',
		mediaType: 'movie',
		favorite: userData?.isFavorite ?? false,
		watched: userData?.played ?? false,
		blurHash: data.blurHash
			? JSON.parse(data.blurHash)
			: null,
		collection: data.Parts?.map((c) => {
			if (!c.Movie) return;
			return {
				id: c.Movie?.id,
				backdrop: c.Movie?.backdrop,
				mediaType: 'movie',
				poster: c.Movie?.poster,
				title: c.Movie?.title?.[0].toUpperCase() + c.Movie?.title?.slice(1) ?? '',
				titleSort: createTitleSort(c.Movie?.title, c.Movie?.releaseDate),
				type: 'movies',
				logo: c.Movie?.[0]?.Media?.find(m => m.type == 'logo')?.src,
				blurHash: c.Movie?.blurHash
					? JSON.parse(c.Movie?.blurHash)
					: null,
			};
		}),
	};

	return response;
};

const translationQuery = ({ id, language }) => {
	return Prisma.validator<Prisma.TranslationFindManyArgs>()({
		where: {
			collectionId: id,
			iso6391: language,
		},
	});
};

const ownerQuery = (id: string) => {
	return Prisma.validator<Prisma.CollectionFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
			Parts: {
				include: {
					Movie: {
						include: {
							AlternativeTitles: true,
							CollectionTo: {
								include: {
									Movie: true,
								},
							},
							Cast: {
								include: {
									Person: true,
								},
							},
							Certification: {
								include: {
									Certification: true,
								},
							},
							Crew: {
								include: {
									Person: true,
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
					},
				},
			},
		},
	});
};

const userQuery = (id: string, userId: string) => {
	return Prisma.validator<Prisma.CollectionFindFirstArgs>()({
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
			Parts: {
				include: {
					Movie: {
						include: {
							AlternativeTitles: true,
							CollectionTo: {
								include: {
									Movie: true,
								},
							},
							Cast: {
								include: {
									Person: true,
								},
							},
							Certification: {
								include: {
									Certification: true,
								},
							},
							Crew: {
								include: {
									Person: true,
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
					},
				},
			},
		},
	});
};
