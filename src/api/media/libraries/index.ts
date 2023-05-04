import { Collection, Library, Media, Movie, Translation, Tv, UserData } from '@/database/config/client';
import { Request, Response } from 'express';

import { KAuthRequest } from '@/types/keycloak';
import { LibraryResponseContent } from '@/types/server';
import { confDb } from '@/database/config';
import { createTitleSort } from '@/tasks/files/filenameParser';
import { getLanguage } from '@/api/middleware';
import { isOwner } from '@/api/middleware/permissions';
import { parseYear } from '@/functions/dateTime';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	const user = (req as KAuthRequest).kauth.grant?.access_token.content.sub;
	const owner = isOwner(req as KAuthRequest);

	const cursorQuery = (req.body.page as number) ?? undefined;
	const skip = cursorQuery
		? 1
		: 0;
	const cursor = cursorQuery
		? { id: cursorQuery }
		: undefined;

	const data = await confDb.library.findFirst({
		where: {
			id: req.params.id,
			User: {
				some: {
					userId: owner
						? undefined
						: user,
				},
			},
		},
		include: {
			Tv: {
				skip,
				take: req.body.take,
				cursor,
				orderBy: {
					titleSort: 'asc',
				},
				where: {
					title: {
						startsWith: req.body.name as string,
					},
					haveEpisodes: {
						gt: 0,
					},
				},
				include: {
					UserData: true,
					Media: {
						orderBy: {
							voteAverage: 'desc',
						},
					},
					Translation: {
						where: {
							iso6391: 'en',
						},
					},
				},
			},
			Movie: {
				skip,
				take: req.body.take,
				cursor,
				orderBy: {
					titleSort: 'asc',
				},
				where: {
					title: {
						startsWith: req.body.name as string,
					},
					folder: {
						not: null,
					},
					VideoFile: {
						some: {
							duration: {
								not: null,
							},
						},
					},
				},
				include: {
					UserData: true,
					CollectionFrom: true,
					Media: {
						orderBy: {
							voteAverage: 'desc',
						},
					},
					Translation: {
						where: {
							iso6391: 'en',
						},
					},
				},
			},
		},
	});

	const response = getContent(data);

	const nextId = response.length < req.body.take
    	? undefined
    	: response[req.body.take - 1]?.id;

	return res.json({
    	nextId: nextId,
    	data: response,
	});
}

type LibraryType = (Library & {
    Movie: (Movie & {
        // _count: Prisma.MovieCountOutputType;
        Translation: Translation[];
        Media: Media[];
        // Genre: GenreMovie[];
        UserData: UserData[];
        CollectionFrom: (Collection & {
            // Movie: Movie;
        })[];
    })[];
    Tv: (Tv & {
        // _count: Prisma.TvCountOutputType;
        Translation: Translation[];
        Media: Media[];
        // Genre: GenreTv[];
        UserData: UserData[];
        // Season: (Season & {
        //     Episode: (Episode & {
        //         VideoFile: VideoFile[];
        //     })[];
        // })[];
    })[];
}) | null


export const getContent = (data: LibraryType) => {
	const response: LibraryResponseContent[] = [];
	if (!data) return response;

	for (const tv of data.Tv) {
		const title = tv.Translation.find(t => t.tvId == tv.id)?.title || tv.title;
		const overview = tv.Translation.find(t => t.tvId == tv.id)?.overview || tv.overview;
		const logo = tv.Media.find(m => m.type == 'logo');
		const userData = tv.UserData?.[0];

		const palette = JSON.parse(tv.colorPalette ?? '{}');

		response.push({
			id: tv.id,
			backdrop: tv.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo?.src,
			mediaType: data.type,
			numberOfEpisodes: tv.numberOfEpisodes ?? 1,
			haveEpisodes: tv.haveEpisodes ?? 0,
			overview: overview,
			colorPalette: {
				logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
				poster: palette?.poster ?? null,
				backdrop: palette?.backdrop ?? null,
			},
			poster: tv.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, tv.firstAirDate),
			type: tv.type ?? 'unknown',
			// genres: tv.Genre,
			year: parseYear(tv.firstAirDate),
		});
	}
	for (const movie of data.Movie) {
		const title = movie.Translation.find(t => t.movieId == movie.id)?.title || movie.title;
		const overview
			= movie.Translation.find(t => t.movieId == movie.id)?.overview || movie.overview;
		const logo = movie.Media.find(m => m.type == 'logo');
		const userData = movie.UserData?.[0];

		const palette = JSON.parse(movie.colorPalette ?? '{}');

		response.push({
			id: movie.id,
			backdrop: movie.backdrop,
			favorite: userData?.isFavorite ?? false,
			watched: userData?.played ?? false,
			logo: logo?.src ?? null,
			mediaType: 'movie',
			overview: overview,
			colorPalette: {
				logo: JSON.parse(logo?.colorPalette ?? '{}') ?? null,
				poster: palette?.poster ?? null,
				backdrop: palette?.backdrop ?? null,
			},
			poster: movie.poster,
			title: title[0].toUpperCase() + title.slice(1),
			titleSort: createTitleSort(title, movie.releaseDate),
			type: data.type,
			// genres: movie.Genre,
			year: parseYear(movie.releaseDate),
			collection: movie.CollectionFrom?.map(c => ({
				id: c.id,
				backdrop: c.backdrop,
				mediaType: 'collection',
				poster: c.poster,
				title: c.title[0].toUpperCase() + c.title.slice(1),
				titleSort: createTitleSort(c.title),
				colorPalette: JSON.parse(c.colorPalette ?? '[]'),
				type: 'collection',
			})),
		});
	}

	return response;
};
