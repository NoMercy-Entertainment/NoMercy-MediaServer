import { Cast, Crew, Media, Movie, Person, Tv } from '@/database/config/client';
import { PersonCast, PersonWithAppends, person } from '@/providers/tmdb/people';
import { Request, Response } from 'express';

// import { KAuthRequest } from '@/types/keycloak';
import { confDb } from '@/database/config';
import { getLanguage } from '@/api/middleware';
import i18next from 'i18next';
// import { isOwner } from '@/api/middleware/permissions';
import { parseYear } from '@/functions/dateTime';
import { sortBy, unique } from '@/functions/stringArray';

export default async function (req: Request, res: Response) {

	const language = getLanguage(req);

	// const user = (req as unknown as KAuthRequest).token
	// const owner = await isOwner(req as KAuthRequest);

	i18next.changeLanguage('en');

	let data: (Person & {
		Media: Media[];
		Cast: (Cast & {
			Tv: Tv | null;
			Movie: Movie | null;
		})[];
		Crew: (Crew & {
			Tv: Tv | null;
			Movie: Movie | null;
		})[];
	}) | null = <(Person & {
		Media: Media[];
		Cast: (Cast & {
			Tv: Tv | null;
			Movie: Movie | null;
		})[];
		Crew: (Crew & {
			Tv: Tv | null;
			Movie: Movie | null;
		})[];
	})>{};

	let p: PersonWithAppends<'details' | 'combined_credits' | 'movie_credits' | 'credits' | 'tv_credits' | 'external_ids' | 'images' | 'translations'> = <PersonWithAppends<'details' | 'combined_credits' | 'movie_credits' | 'credits' | 'tv_credits' | 'external_ids' | 'images' | 'translations'>>{};

	await Promise.all([
		confDb.person.findFirst({
			where: {
				id: parseInt(req.params.id, 10),
			},
			include: {
				Cast: {
					include: {
						Tv: true,
						Movie: true,
					},
				},
				Crew: {
					include: {
						Tv: true,
						Movie: true,
					},
				},
				Media: true,
				// Translation: true,
			},
		}).then((p) => {
			data = p;
		}),
		person(parseInt(req.params.id, 10)).then((person) => {
			p = person;
		}),
	]);

	const result: any = {
		...data,
		...p,
		biography: p.translations.translations.find((t: any) => t.iso_639_1 === language)?.data?.biography || p.biography,
		knownFor: unique(sortBy(p.combined_credits.cast, 'popularity', 'desc'), 'title')
			.map(c => ({
				...c,
				poster: c.poster_path,
				// @ts-ignore
				type: c.media_type,
			}))
			.slice(0, 200),
		credits: {
			cast: sortBy(
				p.credits.cast.map(c => ({
					...c,
					hasItem: data?.Cast.some((cast) => {
						return (c.media_type == 'movie' && c.id == cast.Movie?.id)
							|| (c.media_type == 'tv' && c.id == cast.Tv?.id);
					}),
					poster: c.poster_path,
					year: parseYear(c.release_date ?? c.first_air_date),
				})), 'year', 'desc'
			),
			crew: sortBy(
				p.credits.crew.map(c => ({
					...c,
					hasItem: data?.Crew.some((crew) => {
						return (c.media_type == 'movie' && c.id == crew.Movie?.id)
							|| (c.media_type == 'tv' && c.id == crew.Tv?.id);
					}),
					poster: c.poster_path,
					year: parseYear(c.release_date ?? c.first_air_date),
				})), 'year', 'desc'
			),
		},
		combined_credits: {
			cast: sortBy(
				(p.combined_credits.cast as unknown as PersonCast[])
					.filter(c => !!c.release_date || !!c.first_air_date)
					.map(c => ({
						...c,
						hasItem: data?.Cast.some((cast) => {
							return (c.media_type == 'movie' && c.id == cast.Movie?.id)
								|| (c.media_type == 'tv' && c.id == cast.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
			crew: sortBy(
				(p.combined_credits.crew as unknown as PersonCast[])
					.map(c => ({
						...c,
						hasItem: data?.Crew.some((crew) => {
							return (c.media_type == 'movie' && c.id == crew.Movie?.id)
								|| (c.media_type == 'tv' && c.id == crew.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
		},
		movie_credits: {
			cast: sortBy(
				(p.movie_credits.cast as unknown as PersonCast[])
					.filter(c => !!c.release_date)
					.map(c => ({
						...c,
						hasItem: data?.Cast.some((cast) => {
							return (c.media_type == 'movie' && c.id == cast.Movie?.id)
								|| (c.media_type == 'tv' && c.id == cast.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
			crew: sortBy(
				(p.movie_credits.crew as unknown as PersonCast[])
					.map(c => ({
						...c,
						hasItem: data?.Crew.some((crew) => {
							return (c.media_type == 'movie' && c.id == crew.Movie?.id)
								|| (c.media_type == 'tv' && c.id == crew.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
		},
		tv_credits: {
			cast: sortBy(
				(p.tv_credits.cast as unknown as PersonCast[])
					.filter(c => !!c.first_air_date)
					.map(c => ({
						...c,
						hasItem: data?.Cast.some((cast) => {
							return (c.media_type == 'movie' && c.id == cast.Movie?.id)
								|| (c.media_type == 'tv' && c.id == cast.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
			crew: sortBy(
				(p.tv_credits.crew as unknown as PersonCast[])
					.map(c => ({
						...c,
						hasItem: data?.Crew.some((crew) => {
							return (c.media_type == 'movie' && c.id == crew.Movie?.id)
								|| (c.media_type == 'tv' && c.id == crew.Tv?.id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
			),
		},
		colorPalette: data?.colorPalette
			? JSON.parse(data?.colorPalette)
			: null,
		Media: data?.Media.map((m) => {
			return {
				...m,
				colorPalette: m.colorPalette
					? JSON.parse(m.colorPalette)
					: null,
			};
		}),
		Cast: data?.Cast.map((c) => {
			return {
				...c,
				...c.Movie?.id && {
					...c.Movie,
					type: 'movie',
					colorPalette: c.Movie?.colorPalette
						? JSON.parse(c.Movie?.colorPalette)
						: null,
					blurHash: c.Movie?.blurHash
						? JSON.parse(c.Movie?.blurHash)
						: null,
				},
				...c.Tv?.id && {
					...c.Tv,
					type: 'tv',
					colorPalette: c.Tv?.colorPalette
						? JSON.parse(c.Tv?.colorPalette)
						: null,
					blurHash: c.Tv?.blurHash
						? JSON.parse(c.Tv?.blurHash)
						: null,
				},
				Movie: undefined,
				TV: undefined,
				// Season: c.Season?.id && {
				// 	...c.Season,
				// 	colorPalette: c.Season?.colorPalette
				// 		? JSON.parse(c.Season?.colorPalette)
				// 		: null,
				// 	blurHash: c.Season?.blurHash,
				// },
				// Episode: c.Episode?.id && {
				// 	...c.Episode,
				// 	colorPalette: c.Episode?.colorPalette
				// 		? JSON.parse(c.Episode?.colorPalette)
				// 		: null,
				// 	blurHash: c.Episode?.blurHash
				// 		? JSON.parse(c.Episode?.blurHash)
				// 		: null,
				// },
			};
		}).filter(c => c.type),
		Crew: data?.Crew.map((c) => {
			return {
				...c,
				...c.Movie?.id && {
					...c.Movie,
					type: 'movie',
					colorPalette: c.Movie?.colorPalette
						? JSON.parse(c.Movie?.colorPalette)
						: null,
					blurHash: c.Movie?.blurHash
						? JSON.parse(c.Movie?.blurHash)
						: null,
				},
				...c.Tv?.id && {
					...c.Tv,
					type: 'tv',
					colorPalette: c.Tv?.colorPalette
						? JSON.parse(c.Tv?.colorPalette)
						: null,
					blurHash: c.Tv?.blurHash
						? JSON.parse(c.Tv?.blurHash)
						: null,
				},
				Movie: undefined,
				TV: undefined,
				// Season: c.Season?.id && {
				// 	...c.Season,
				// 	colorPalette: c.Season?.colorPalette
				// 		? JSON.parse(c.Season?.colorPalette)
				// 		: null,
				// 	blurHash: c.Season?.blurHash,
				// },
				// Episode: c.Episode?.id && {
				// 	...c.Episode,
				// 	colorPalette: c.Episode?.colorPalette
				// 		? JSON.parse(c.Episode?.colorPalette)
				// 		: null,
				// 	blurHash: c.Episode?.blurHash
				// 		? JSON.parse(c.Episode?.blurHash)
				// 		: null,
				// },
			};
		}).filter(c => c.type),
	};

	return res.json(result);

}
