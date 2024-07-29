import { Request, Response } from 'express-serve-static-core';
import i18n from '@server/loaders/i18n';
import { requestWorker } from '@server/api/requestWorker';
import { person, personAppend, PersonCast, PersonWithAppends } from '@server/providers/tmdb/people';
import { inArray } from 'drizzle-orm';
import { sortBy, unique } from '@server/functions/stringArray';
import { parseYear } from '@server/functions/dateTime';

export default async function(req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		id: req.params.id,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500)
			.json({
				status: 'error',
				message: result.error.message,
			});
	}
	return res.json(result.result);
}

export const exec = ({
	id,
	language,
}: { id: string, language: string }) => {
	return new Promise(async (resolve) => {

		await i18n.changeLanguage('en');

		const data = globalThis.mediaDb.query.people.findFirst({
			where: (people, { eq }) => eq(people.id, parseInt(id, 10)),
			with: {
				casts: {
					// with: {
					// 	tv: true,
					// 	movie: true,
					// },
				},
				crews: {
					// with: {
					// 	tv: true,
					// 	movie: true,
					// },
				},
				// medias: true,
				// translations: true,
			},
		});

		const tvIds = data?.casts.filter(t => !!t.tv_id)
			.map(c => c.tv_id!)
			.concat(0) ?? [0];
		const movieIds = data?.casts.filter(m => !!m.movie_id)
			.map(c => c.movie_id!)
			.concat(0) ?? [0];

		// const imagesData = globalThis.mediaDb.query.images.findMany({
		// 	where: (images, { eq, and }) => and(
		// 		eq(images.person_id, parseInt(id, 10)),
		// 		eq(images.type, 'profile')
		// 	),
		// });

		// const movieData = globalThis.mediaDb.query.movies.findMany({
		// 	where: (movies, { eq }) => eq(movies.id, parseInt(id, 10)),
		// });

		// const tvData = globalThis.mediaDb.query.tvs.findMany({
		// 	where: (tv, { eq }) => eq(tv.id, parseInt(id, 10)),
		// });

		// const mediasData = globalThis.mediaDb.query.medias.findMany({
		// 	where: (medias, { eq, and }) => and(
		// 		eq(medias.person_id, parseInt(id, 10)),
		// 		eq(medias.type, 'profile')
		// 	),
		// });

		const translationsData = globalThis.mediaDb.query.translations.findFirst({
			where: (translations, {
				eq,
				and,
				or,
			}) => or(
				and(
					eq(translations.iso6391, language),
					inArray(translations.tv_id, tvIds)
				),
				and(
					eq(translations.iso6391, language),
					inArray(translations.movie_id, movieIds)
				)
			),
		});

		let p: PersonWithAppends<typeof personAppend[number]> | undefined;

		await person(parseInt(id, 10))
			.then((person) => {
				p = person;
			});

		const result: any = {
			...data,
			...p,
			biography: translationsData?.biography == null
				?				data?.biography ?? p?.biography
				:				translationsData?.biography,
			knownFor: p && unique(sortBy(p.combined_credits?.cast ?? [], 'popularity', 'desc'), 'title')
				.map(c => ({
					...c,
					poster: c.poster_path,
					// @ts-ignore
					type: c.media_type,
				}))
				.slice(0, 200),
			credits: {
				cast: p && sortBy(
					p.credits.cast.map(c => ({
						...c,
						hasItem: data?.casts.some((cast) => {
							return (c.media_type == 'movie' && c.id == cast.movie_id)
								|| (c.media_type == 'tv' && c.id == cast.tv_id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
				),
				crew: p && sortBy(
					p.credits.crew.map(c => ({
						...c,
						hasItem: data?.crews.some((crew) => {
							return (c.media_type == 'movie' && c.id == crew.movie_id)
								|| (c.media_type == 'tv' && c.id == crew.tv_id);
						}),
						poster: c.poster_path,
						year: parseYear(c.release_date ?? c.first_air_date),
					})), 'year', 'desc'
				),
			},
			combined_credits: {
				cast: p && sortBy(
					(p.combined_credits?.cast as unknown as PersonCast[] ?? [])
						.filter(c => !!c.release_date || !!c.first_air_date)
						.map(c => ({
							...c,
							hasItem: data?.casts.some((cast) => {
								return (c.media_type == 'movie' && c.id == cast.movie_id)
									|| (c.media_type == 'tv' && c.id == cast.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
				crew: p && sortBy(
					(p.combined_credits?.crew as unknown as PersonCast[] ?? [])
						.map(c => ({
							...c,
							hasItem: data?.crews.some((crew) => {
								return (c.media_type == 'movie' && c.id == crew.movie_id)
									|| (c.media_type == 'tv' && c.id == crew.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
			},
			movie_credits: {
				cast: p && sortBy(
					(p.movie_credits.cast as unknown as PersonCast[])
						.filter(c => !!c.release_date)
						.map(c => ({
							...c,
							hasItem: data?.casts.some((cast) => {
								return (c.media_type == 'movie' && c.id == cast.movie_id)
									|| (c.media_type == 'tv' && c.id == cast.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
				crew: p && sortBy(
					(p.movie_credits.crew as unknown as PersonCast[])
						.map(c => ({
							...c,
							hasItem: data?.crews.some((crew) => {
								return (c.media_type == 'movie' && c.id == crew.movie_id)
									|| (c.media_type == 'tv' && c.id == crew.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
			},
			tv_credits: {
				cast: p && sortBy(
					(p.tv_credits.cast as unknown as PersonCast[])
						.filter(c => !!c.first_air_date)
						.map(c => ({
							...c,
							hasItem: data?.casts.some((cast) => {
								return (c.media_type == 'movie' && c.id == cast.movie_id)
									|| (c.media_type == 'tv' && c.id == cast.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
				crew: p && sortBy(
					(p.tv_credits.crew as unknown as PersonCast[])
						.map(c => ({
							...c,
							hasItem: data?.crews.some((crew) => {
								return (c.media_type == 'movie' && c.id == crew.movie_id)
									|| (c.media_type == 'tv' && c.id == crew.tv_id);
							}),
							poster: c.poster_path,
							year: parseYear(c.release_date ?? c.first_air_date),
						})), 'year', 'desc'
				),
			},
			color_palette: data?.colorPalette
				?				JSON.parse(data?.colorPalette)
				:				null,
			// Media: data?.Media.map((m) => {
			// 	return {
			// 		...m,
			// 		color_palette: m.colorPalette
			// 			? JSON.parse(m.colorPalette)
			// 			: null,
			// 	};
			// }),
			// Cast: data?.casts.map((c) => {
			// 	return {
			// 		...c,
			// 		...c.movie?.id && {
			// 			...c.movie,
			// 			type: 'movie',
			// 			color_palette: c.movie?.colorPalette
			// 				? JSON.parse(c.movie?.colorPalette)
			// 				: null,
			// 			blurHash: c.movie?.blurHash
			// 				? JSON.parse(c.movie?.blurHash)
			// 				: null,
			// 		},
			// 		...c.tv?.id && {
			// 			...c.tv,
			// 			type: 'tv',
			// 			color_palette: c.tv?.colorPalette
			// 				? JSON.parse(c.tv?.colorPalette)
			// 				: null,
			// 			blurHash: c.tv?.blurHash
			// 				? JSON.parse(c.tv?.blurHash)
			// 				: null,
			// 		},
			// 		movie: undefined,
			// 		TV: undefined,
			// 		// Season: c.Season?.id && {
			// 		// 	...c.Season,
			// 		// 	color_palette: c.Season?.colorPalette
			// 		// 		? JSON.parse(c.Season?.colorPalette)
			// 		// 		: null,
			// 		// 	blurHash: c.Season?.blurHash,
			// 		// },
			// 		// Episode: c.Episode?.id && {
			// 		// 	...c.Episode,
			// 		// 	color_palette: c.Episode?.colorPalette
			// 		// 		? JSON.parse(c.Episode?.colorPalette)
			// 		// 		: null,
			// 		// 	blurHash: c.Episode?.blurHash
			// 		// 		? JSON.parse(c.Episode?.blurHash)
			// 		// 		: null,
			// 		// },
			// 	};
			// }).filter(c => c.type),
			// Crew: data?.crews.map((c) => {
			// 	return {
			// 		...c,
			// 		...c.movie?.id && {
			// 			...c.movie,
			// 			type: 'movie',
			// 			color_palette: c.movie?.colorPalette
			// 				? JSON.parse(c.movie?.colorPalette)
			// 				: null,
			// 			blurHash: c.movie?.blurHash
			// 				? JSON.parse(c.movie?.blurHash)
			// 				: null,
			// 		},
			// 		...c.tv?.id && {
			// 			...c.tv,
			// 			type: 'tv',
			// 			color_palette: c.tv?.colorPalette
			// 				? JSON.parse(c.tv?.colorPalette)
			// 				: null,
			// 			blurHash: c.tv?.blurHash
			// 				? JSON.parse(c.tv?.blurHash)
			// 				: null,
			// 		},
			// 		movie: undefined,
			// 		TV: undefined,
			// 		// Season: c.Season?.id && {
			// 		// 	...c.Season,
			// 		// 	color_palette: c.Season?.colorPalette
			// 		// 		? JSON.parse(c.Season?.colorPalette)
			// 		// 		: null,
			// 		// 	blurHash: c.Season?.blurHash,
			// 		// },
			// 		// Episode: c.Episode?.id && {
			// 		// 	...c.Episode,
			// 		// 	color_palette: c.Episode?.colorPalette
			// 		// 		? JSON.parse(c.Episode?.colorPalette)
			// 		// 		: null,
			// 		// 	blurHash: c.Episode?.blurHash
			// 		// 		? JSON.parse(c.Episode?.blurHash)
			// 		// 		: null,
			// 		// },
			// 	};
			// }).filter(c => c.type),
		};

		return resolve(result);
	});
};
