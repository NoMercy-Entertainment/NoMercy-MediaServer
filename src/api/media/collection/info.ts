/* eslint-disable indent */

import { Request, Response } from 'express-serve-static-core';

import { parseYear } from '@server/functions/dateTime';
import { requestWorker } from '@server/api/requestWorker';
import { getClosestRating } from '@server/functions/stringArray';
import { LibraryResponseContent } from '@server/types/server';
import { getCollection } from '@server/db/media/actions/collections';

export default async function(req: Request, res: Response) {

	const result = await requestWorker({
		filename: __filename,
		language: req.language,
		take: req.body.take,
		page: req.body.page,
		id: req.params.id,
		user_id: req.user.sub,
	});

	if (result.error) {
		return res.status(result.error.code ?? 500)
			.json({
				status: 'error',
				message: result.error,
			});
	}

	if (req.body.version == 'lolomo') {

		return res.json({
			nextId: null,
			data: [
				{
					id: result.result.collection[0].titleSort,
					title: result.result.title,
					moreLink: '',
					items: result.result.collection,
				},
			],
		});

	}

	const nextId = result.result.length < req.body.take
		?		undefined
		:		result.result.length + req.body.page;

	return res.json({
		nextId: nextId,
		data: result.result,
	});

}

export const exec = ({
	id,
	language,
	user_id,
}:
	{ id: string, language: string, user_id: string }) => {

	return new Promise((resolve, reject) => {
		try {

			const collection = getCollection({
				id: parseInt(id, 10),
				user_id,
				language,
			});
			if (!collection) return reject();

			const response: LibraryResponseContent[] = [];

			collection?.collection_movie?.forEach((c) => {
				response.push(collectionItem({
					data: c.movie,
					translations: collection.translations.find(t => t.movie_id == c.movie.id),
					images: collection.images.filter(i => i.movie_id == c.movie.id),
					language,
					userData: collection.userData.find(u => u.movie_id == c.movie.id),
					medias: collection.medias.filter(m => m.movie_id == c.movie.id),
				}));
			});

			// const title = collection.translations?.[0]?.title ?? collection.title;
			const title = collection.title;
			const overview = collection.translations?.[0]?.overview ?? collection.overview;

			resolve({
				title: title,
				overview: overview,
				backdrop: collection.backdrop,
				poster: collection.poster,
				titleSort: collection.titleSort,
				type: 'movie',
				mediaType: 'movie',
				blurHash: collection.blurHash
					?					JSON.parse(collection.blurHash)
					:					null,
				color_palette: collection.colorPalette
					?					JSON.parse(collection.colorPalette)
					:					null,
				collection: response.sort((a, b) => a.year! - b.year!),
			});

		} catch (error: any) {
			console.error(error);
			return reject({
				error: {
					code: 500,
					message: error,
				},
			});
		}
	});
};

const collectionItem = ({
	data,
	translations,
	images,
	language,
	userData,
	medias,
}): LibraryResponseContent => {

	// const title = translations?.title ?? data.title;
	const title = data.title;
	const overview = translations?.overview ?? data.overview;
	const logo = images?.find(i => i.type == 'logo' && i.iso6391 == 'en');

	return {
		id: data.id,
		backdrop: data.backdrop,
		favorite: userData?.isFavorite == 1 ?? false,
		watched: userData?.played == 1 ?? false,
		logo: logo?.filePath ?? null,
		mediaType: 'movie',
		overview: overview,
		color_palette: {
			logo: logo?.colorPalette
				?				JSON.parse(logo?.colorPalette ?? '{}')
				:				null,
			poster: data.palette?.poster ?? null,
			backdrop: data.palette?.backdrop ?? null,
		},
		poster: data.poster,
		title: title[0].toUpperCase() + title.slice(1),
		titleSort: title.titleSort,
		type: 'movie',
		year: parseYear(data.releaseDate) as number,
		genres: data.genre_movie?.map(g => ({
			id: g.genre_id,
			item_id: g.movie_id,
			name: g.genre.name,
		})) ?? [],
		rating: getClosestRating(data.certification_movie ?? [], language),
		videoId: medias?.at(0)?.src,
	};
};


// export default function (req: Request, res: Response) {
// 	const data = globalThis.mediaDb.query.collections.findFirst({
// 		where: and(
// 			eq(collections.id, parseInt(req.params.id, 10)),
// 			gt(collections.parts, 0)
// 		),
// 		with: {
// 			collection_movie: {
// 				columns: {},
// 				with: {
// 					movie: {
// 						with: {
// 							library: {
// 								with: {
// 									library_user: true,
// 								},
// 							},
// 							genre_movie: {
// 								with: {
// 									genre: true,
// 								},
// 							},
// 							certification_movie: {
// 								where: (certification_movie, { or, eq }) => or(
// 									eq(certification_movie.iso31661, 'NL'),
// 									eq(certification_movie.iso31661, 'US')
// 								),
// 								with: {
// 									certification: true,
// 								},
// 							},
// 						},
// 					},
// 				},
// 			},
// 			translations: {
// 				where: eq(translations.iso6391, req.language),
// 			},
// 		},
// 	});

// 	if(!data) {
// 		return res.status(404).json({
// 			status: 'error',
// 			message: 'Collection not found',
// 		});
// 	}

// 	const movieGids = data.collection_movie?.map(c => c.movie.id) ?? [];

// 	const translationsResponse = globalThis.mediaDb.query.translations.findMany({
// 		where: (translations, { eq, and }) => and(
// 			eq(translations.iso6391, req.language),
// 			inArray(translations.movie_id, movieGids)
// 		),
// 	});

// 	const imagesResponse = globalThis.mediaDb.query.images.findMany({
// 		where: (images, { eq, and }) => and(
// 			eq(images.type, 'logo'),
// 			eq(images.iso6391, 'en'),
// 			inArray(images.movie_id, movieGids)
// 		),
// 	});

// 	const mediasResponse = globalThis.mediaDb.query.medias.findMany({
// 		where: (medias, { eq, and }) => and(
// 			eq(medias.type, 'Trailer'),
// 			inArray(medias.movie_id, movieGids)
// 		),
// 	});

// 	const movieCertificationResponse = globalThis.mediaDb.query.certification_movie.findMany({
// 		where: (certification_movie, { and, or, eq }) => or(
// 			and(
// 				inArray(certification_movie.movie_id, movieGids),
// 				eq(certification_movie.iso31661, 'NL'),
// 			),
// 			and(
// 				inArray(certification_movie.movie_id, movieGids),
// 				eq(certification_movie.iso31661, 'US'),
// 			),
// 		),
// 		columns: {
// 			movie_id: true,
// 		},
// 		with: {
// 			certification: true,
// 		},
// 	});

// 	const userDatasResponse = globalThis.mediaDb.query.userData.findMany({
// 		where: (userData, { eq, and }) => and(
// 			eq(userData.user_id, req.user.sub),
// 			inArray(userData.movie_id, movieGids)
// 		),
// 	});


// 	if (!data) {
// 		return res.status(404).json({
// 			status: 'error',
// 			message: 'Collection not found',
// 		});
// 	}

// 	const title = data.translations?.[0]?.title || data.title;
// 	const overview = data.translations?.[0]?.overview || data.overview;

// 	const response = {
// 		id: data.id,
// 		overview: overview,
// 		backdrop: data.backdrop,
// 		poster: data.poster,
// 		title: title[0].toUpperCase() + title.slice(1),
// 		titleSort: data.titleSort,
// 		type: 'movie',
// 		mediaType: 'movie',
// 		blurHash: data.blurHash
// 			? JSON.parse(data.blurHash)
// 			: null,
// 		color_palette: data.colorPalette
// 			? JSON.parse(data.colorPalette)
// 			: null,
// 		collection: data.collection_movie?.map((c) => {
// 			if (!c.movie || (!isOwner(req) && !c.movie.library.library_user.some(u => u.user_id == req.user.sub))) return;

// 			const title = translationsResponse.find(t => t.movie_id == c.movie.id)?.title || c.movie.title;
// 			const overview = translationsResponse.find(t => t.movie_id == c.movie.id)?.overview || c.movie.overview;

// 			return {
// 				id: c.movie.id,
// 				favorite: userDatasResponse.find(i => i.movie_id == c.movie.id)?.isFavorite ?? false,
// 				watched: userDatasResponse.find(i => i.movie_id == c.movie.id)?.played ?? false,
// 				backdrop: c.movie.backdrop,
// 				poster: c.movie.poster,
// 				logo: imagesResponse.find(i => i.movie_id == c.movie.id)?.filePath,
// 				mediaType: 'movie',
// 				title: title,
// 				overview: overview,
// 				year: parseYear(c.movie.releaseDate),
// 				titleSort: createTitleSort(c.movie.title, c.movie.releaseDate),
// 				type: 'movie',
// 				releaseDate: c.movie.releaseDate,
// 				blurHash: c.movie.blurHash
// 					? JSON.parse(c.movie.blurHash)
// 					: null,
// 				color_palette: c.movie.colorPalette
// 					? JSON.parse(c.movie.colorPalette)
// 					: null,

// 				genres: c.movie.genre_movie.map(p => ({
// 					id: p?.genre.id,
// 					name: p?.genre.name,
// 					item_id: p?.genre.id,
// 				})),
// 				rating: movieCertificationResponse.find(i => i.movie_id == c.movie.id)?.certification,
// 				videoId: mediasResponse.find(i => i.movie_id == c.movie.id)?.src,
// 			};
// 		}).sort((a, b) => (a?.releaseDate && b?.releaseDate) ? Date.parse(a?.releaseDate as string) - Date.parse(b?.releaseDate as string) : 1),
// 	};

// 	return res.json(response);
// }
