import {
	AlternativeTitles,
	Cast,
	CastMovie,
	Certification,
	CertificationMovie,
	Collection,
	CollectionMovie,
	Crew,
	CrewMovie,
	Genre,
	GenreMovie,
	Keyword,
	KeywordMovie,
	Library,
	Media,
	Movie,
	Person,
	Prisma,
	SpecialItem,
	UserData,
	VideoFile,
} from '@prisma/client'
import { Request, Response } from 'express';

import { KAuthRequest } from 'types/keycloak';
import Logger from '../../../functions/logger';
import { confDb } from '../../../database/config';
import { createTitleSort } from '../../../tasks/files/filenameParser';
import { deviceId } from '../../../functions/system';
import { isOwner } from '../../middlewares/permissions';

export default async function (req: Request, res: Response) {
    
	const language = req.acceptsLanguages()[0] != 'undefined' ? req.acceptsLanguages()[0].split('-')[0] : 'en';

	const servers = req.body.servers?.filter((s: any) => !s.includes(deviceId)) ?? [];
	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	if (owner) {
		confDb.collection
			.findFirst(ownerQuery(req.params.id, language))
			.then(async (collection) => {
				if (!collection) {
					return res.json({
						status: 'ok',
						message: `Something went wrong getting library`,
					});
				}
				return res.json(await getContent(collection, language, servers));
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
			.findFirst(userQuery(req.params.id, user, language))
			.then(async (collection) => {
				if (!collection) {
					return res.json({
						status: 'ok',
						message: `Something went wrong getting library`,
					});
				}
				return res.json(await getContent(collection, language, servers));
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

type MovieWithInfo = Collection & {
    Movie: (CollectionMovie & {
        Movie: Movie & {
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
    })[];
};


const getContent = async (data: MovieWithInfo, language: string, servers: string[]) => {
	const translations: any[] = [];
	await confDb.translation.findMany(translationQuery({ id: data.id, language })).then((data) => translations.push(...data));

	const title = translations.find((t) => t.translationableType == 'movie' && t.translationableId == data.id)?.title || data.title;
	const overview = translations.find((t) => t.translationableType == 'movie' && t.translationableId == data.id)?.overview || data.overview;

    const logo = data.Movie[0].Movie.Media.find((m) => m.type == 'logo')?.src ?? null;
    const userData = data.Movie[0].Movie.UserData?.[0];

    const response = {
        id: data.id,
        backdrop: data.backdrop,
        favorite: userData?.isFavorite ?? false,
        watched: userData?.played ?? false,
        logo: logo,
        mediaType: 'collections',
        overview: overview,
        poster: data.poster,
        title: title[0].toUpperCase() + title.slice(1),
        titleSort: createTitleSort(title),
        type: 'collections',
        collection: data.Movie.map(c => ({
            id: c.Movie.id,
            backdrop: c.Movie.backdrop,
            mediaType: 'movies',
            poster: c.Movie.poster,
            title: c.Movie.title[0].toUpperCase() + c.Movie.title.slice(1),
            titleSort: createTitleSort(c.Movie.title, c.Movie.releaseDate),
            type: 'movies',
        })),
    }

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
	return Prisma.validator<Prisma.CollectionFindFirstArgs>()({
		where: {
			id: parseInt(id, 10),
		},
		include: {
            Movie: {
                include: {
                    Movie: {
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
                        }
                    }
                }
            }
		},
	});
};

const userQuery = (id: string, userId: string, language: string) => {
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
            Movie: {
                include: {
                    Movie: {
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
                        }
                    }
                }
            }
		},
	});
};
