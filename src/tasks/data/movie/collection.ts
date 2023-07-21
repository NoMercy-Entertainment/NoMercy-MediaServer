import { CompleteMovieAggregate } from './fetchMovie';
import colorPalette from '@server/functions/colorPalette';
// import createBlurHash from '@server/functions/createBlurHash';
import { createTitleSort } from '../../files/filenameParser';
import { insertCollection } from '@server/db/media/actions/collections';
import { insertMovie } from '@server/db/media/actions/movies';
import { insertGenreMovie } from '@server/db/media/actions/genre_movie';
import { insertTranslation } from '@server/db/media/actions/translations';
import { insertCollectionMovie } from '@server/db/media/actions/collection_movie';
import Logger from '@server/functions/logger/logger';

const collection = async (
	movie: CompleteMovieAggregate,
	libraryId: string,
	transaction: any[]
) => {

	try {
		const collection = movie.collection;

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			// collection.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${collection.poster_path}`).then((hash) => {
			// 	blurHash.poster = hash;
			// }),
			// collection.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${collection.backdrop_path}`).then((hash) => {
			// 	blurHash.backdrop = hash;
			// }),
			collection.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${collection.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
			collection.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${collection.backdrop_path}`).then((hash) => {
				palette.backdrop = hash;
			}),
		]);

		try {
			insertCollection({
				backdrop: collection.backdrop_path,
				id: collection.id,
				overview: collection.overview,
				parts: collection.parts.length,
				poster: collection.poster_path,
				blurHash: JSON.stringify(blurHash),
				colorPalette: JSON.stringify(palette),
				title: collection.name,
				titleSort: createTitleSort(collection.name),
				library_id: libraryId,
			});

		} catch (error) {

			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}

		for (const tr of collection.translations.translations) {
			try {
				insertTranslation({
					englishName: tr.english_name,
					homepage: tr.homepage,
					iso31661: tr.iso_3166_1,
					iso6391: tr.iso_639_1,
					name: tr.name,
					overview: tr.data && tr.data?.overview
						? tr.data?.overview
						: null,
					title: tr.data && tr.data?.name
						? tr.data?.name
						: null,
					collection_id: collection.id,
				}, 'collection');
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify([`${__filename}`, error]),
				});
			}
		}

		for (const p of collection.parts) {

			const palette: any = {
				poster: undefined,
				backdrop: undefined,
			};

			const blurHash: any = {
				poster: undefined,
				backdrop: undefined,
			};

			await Promise.all([
				// p.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${p.poster_path}`).then((hash) => {
				// 	blurHash.poster = hash;
				// }),
				// p.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${p.backdrop_path}`).then((hash) => {
				// 	blurHash.backdrop = hash;
				// }),
				p.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${p.poster_path}`).then((hash) => {
					palette.poster = hash;
				}),
				p.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${p.backdrop_path}`).then((hash) => {
					palette.backdrop = hash;
				}),
			]);

			try {
				insertMovie({
					id: p.id,
					adult: p.adult,
					backdrop: p.backdrop_path,
					blurHash: JSON.stringify(blurHash),
					colorPalette: JSON.stringify(palette),
					originalLanguage: p.original_language,
					originalTitle: p.original_title,
					overview: p.overview,
					popularity: p.popularity,
					poster: p.poster_path,
					releaseDate: p.release_date,
					title: p.title,
					titleSort: createTitleSort(p.title, p.release_date),
					voteAverage: p.vote_average,
					voteCount: p.vote_count,
					library_id: libraryId,
				});

			} catch (error) {

				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify([`${__filename}`, error]),
				});
			}

			p.genre_ids?.map((g) => {
				insertGenreMovie({
					genre_id: g,
					movie_id: p.id,
				});
			});

			try {
				insertCollectionMovie({
					collection_id: collection.id,
					movie_id: p.id,
				});

			} catch (error) {

				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify([`${__filename}`, error]),
				});
			}
		}


	} catch (error) {
		console.log(error);
	}
	// const collectionInsert = {
	// 	backdrop: collection.backdrop_path,
	// 	id: collection.id,
	// 	overview: collection.overview,
	// 	parts: collection.parts.length,
	// 	poster: collection.poster_path,
	// 	blurHash: JSON.stringify(blurHash),
	// 	colorPalette: JSON.stringify(palette),
	// 	title: collection.name,
	// 	titleSort: createTitleSort(collection.name),
	// 	library_id: libraryId,
	// 	movie_id: movie.id,
	// 	Parts: {
	// 		connectOrCreate: parts.map((p) => {
	// 			return {
	// 				where: {
	// 					collectionId_movie_id: {
	// 						collection_id: collection.id,
	// 						movie_id: p.id,
	// 					},
	// 				},
	// 				create: {
	// 					Movie: {
	// 						connectOrCreate: {
	// 							where: {
	// 								id: p.id,
	// 							},
	// 							create: {
	// 								id: p.id,
	// 								adult: p.adult,
	// 								backdrop: p.backdrop_path,
	// 								blurHash: p.blurHash,
	// 								colorPalette: p.colorPalette,
	// 								originalLanguage: p.original_language,
	// 								originalTitle: p.original_title,
	// 								overview: p.overview,
	// 								popularity: p.popularity,
	// 								poster: p.poster_path,
	// 								releaseDate: p.release_date,
	// 								title: p.title,
	// 								titleSort: createTitleSort(p.title, p.release_date),
	// 								voteAverage: p.vote_average,
	// 								voteCount: p.vote_count,
	// 								library_id: libraryId,
	// 								Genre: {
	// 									connectOrCreate: p.genre_ids!.map((g) => {
	// 										return {
	// 											where: {
	// 												genre_movie_unique: {
	// 													genre_id: g,
	// 													movie_id: p.id,
	// 												},
	// 											},
	// 											create: {
	// 												genre_id: g,
	// 											},
	// 										};
	// 									}),
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			};
	// 		}),
	// 	},
	// 	Translation: {
	// 		connectOrCreate: collection.translations.translations.map((tr) => {
	// 			return {
	// 				where: {
	// 					collectionId_iso31661_iso6391: {
	// 						iso31661: tr.iso_3166_1,
	// 						iso6391: tr.iso_639_1,
	// 						collection_id: collection.id,
	// 					},
	// 				},
	// 				create: {
	// 					englishName: tr.english_name,
	// 					homepage: tr.homepage,
	// 					iso31661: tr.iso_3166_1,
	// 					iso6391: tr.iso_639_1,
	// 				},
	// 			};
	// 		}),
	// 	},
	// });

	// transaction.push(
	// 	confDb.collection.upsert({
	// 		where: {
	// 			id: collection.id,
	// 		},
	// 		update: collectionInsert,
	// 		create: collectionInsert,
	// 	})
	// );

	// for (const p of collection.parts) {

	// 	const genresCollectionInsert = p.genre_ids!.map((g) => {
	// 		return {
	// 			create: {
	// 				genre_id: g,
	// 			},
	// 			where: {
	// 				genre_movie_unique: {
	// 					genre_id: g,
	// 					movie_id: p.id,
	// 				},
	// 			},
	// 		};
	// 	});

	// 	const blurHash = {
	// 		poster: p.poster_path
	// 			? await createBlurHash(`https://image.tmdb.org/t/p/w185${p.poster_path}`)
	// 			: undefined,
	// 		backdrop: p.backdrop_path
	// 			? await createBlurHash(`https://image.tmdb.org/t/p/w185${p.backdrop_path}`)
	// 			: undefined,
	// 	};

	// 	const movieCollectionInsert = {
	// 		adult: p.adult,
	// 		backdrop: p.backdrop_path,
	// 		id: p.id,
	// 		originalLanguage: p.original_language,
	// 		originalTitle: p.original_title,
	// 		overview: p.overview,
	// 		popularity: p.popularity,
	// 		poster: p.poster_path,
	// 		blurHash: JSON.stringify(blurHash),
	// 		releaseDate: p.release_date,
	// 		tagline: p.tagline,
	// 		title: p.title,
	// 		titleSort: createTitleSort(p.title),
	// 		video: p.video.toString(),
	// 		voteAverage: p.vote_average,
	// 		voteCount: p.vote_count,
	// 		library_id: libraryId,
	// 		Genre: {
	// 			connectOrCreate: genresCollectionInsert,
	// 		},
	// 		Collection: {
	// 			connect: {
	// 				collectionId_movie_id: {
	// 					collection_id: collection.id,
	// 					movie_id: p.id,
	// 				},
	// 			},
	// 		},
	// 	};

	// 	transaction.push(
	// 		confDb.movie.upsert({
	// 			where: {
	// 				id: p.id,
	// 			},
	// 			create: movieCollectionInsert,
	// 			update: movieCollectionInsert,
	// 		})
	// 	);
	// };
	// for (const tr of collection.translations.translations) {

	// 	const collectionTranslationsInsert = {
	// 		englishName: tr.english_name,
	// 		homepage: tr.homepage,
	// 		iso31661: tr.iso_3166_1,
	// 		iso6391: tr.iso_639_1,
	// 		name: tr.name,
	// 		overview: tr.data && tr.data?.overview
	// 			? tr.data?.overview
	// 			: null,
	// 		title: tr.data && tr.data?.name
	// 			? tr.data?.name
	// 			: null,
	// 		collection_id: collection.id,
	// 	};

	// 	transaction.push(
	// 		confDb.translation.upsert({
	// 			where: {
	// 				collectionId_iso31661_iso6391: {
	// 					collection_id: collection.id,
	// 					iso6391: tr.iso_639_1,
	// 					iso31661: tr.iso_3166_1,
	// 				},
	// 			},
	// 			update: collectionTranslationsInsert,
	// 			create: collectionTranslationsInsert,
	// 		})
	// 	);
	// };

};

export default collection;
