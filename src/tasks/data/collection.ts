import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { createTitleSort } from '../../tasks/files/filenameParser';
import { CompleteMovieAggregate } from './fetchMovie';

const collection = async (movie: CompleteMovieAggregate, libraryId: string, transaction: any[], collectionMovieInsert: Prisma.CollectionMovieCreateOrConnectWithoutMovieInput[]) => {
	const collection = movie.collection;
	
	collectionMovieInsert.push({
		where: {
			collectionId_movieId: {
				collectionId: collection.id,
				movieId: movie.id,
			},
		},
		create: {
			collectionId: collection.id,
		},
	});

	const collectionInsert = Prisma.validator<Prisma.CollectionUncheckedCreateInput>()({
		backdrop: collection.backdrop_path,
		id: collection.id,
		overview: collection.overview,
		parts: collection.parts.length,
		poster: collection.poster_path,
		title: collection.name,
		titleSort: createTitleSort(collection.name),
		libraryId: libraryId,
	});

	// transaction.push(
	await	confDb.collection.upsert({
			where: {
				id: collection.id,
			},
			update: collectionInsert,
			create: collectionInsert,
		})
	// );

	for (const p of collection.parts) {
		
		// collectionMovieInsert.push({
		// 	where: {
		// 		collectionId_movieId: {
		// 			collectionId: collection.id,
		// 			movieId: p.id,
		// 		},
		// 	},
		// 	create: {
		// 		collectionId: collection.id,
		// 	},
		// });

		const genresCollectionInsert = p.genre_ids!.map((g) => {
			return {
				create: {
					genreId: g
				},
				where: {
					genre_movie_unique: {
						genreId: g,
						movieId: p.id,
					}
				}
			}
		});

		const movieCollectionInsert = Prisma.validator<Prisma.MovieUncheckedCreateWithoutCollectionInput>()({
			adult: p.adult,
			backdrop: p.backdrop_path,
			id: p.id,
			originalLanguage: p.original_language,
			originalTitle: p.original_title,
			overview: p.overview,
			popularity: p.popularity,
			poster: p.poster_path,
			releaseDate: p.release_date,
			tagline: p.tagline,
			title: p.title,
			titleSort: createTitleSort(p.title),
			video: p.video.toString(),
			voteAverage: p.vote_average,
			voteCount: p.vote_count,
			libraryId: libraryId,
			Genre: {
				connectOrCreate: genresCollectionInsert,
			},
		});

		// transaction.push(
		await	confDb.movie.upsert({
				where: {
					id: p.id,
				},
				create: movieCollectionInsert,
				update: movieCollectionInsert,
			})
		// );
	};
	for (const tr of collection.translations.translations) {
		
		const collectionTranslationsInsert = Prisma.validator<Prisma.TranslationUncheckedCreateInput>()({
			englishName: tr.english_name,
			homepage: tr.homepage,
			iso31661: tr.iso_3166_1,
			iso6391: tr.iso_639_1,
			name: tr.name,
			overview: tr.data && tr.data?.overview ? tr.data?.overview : null,
			title: tr.data && tr.data?.name ? tr.data?.name : null,
			translationableId: collection.id,
			translationableType: 'collection',
		});

		// transaction.push(
		await	confDb.translation.upsert({
				where: {
					translationableId_translationableType_iso6391: {
						translationableId: collection.id,
						translationableType: 'collection',
						iso6391: tr.iso_639_1,
					},
				},
				update: collectionTranslationsInsert,
				create: collectionTranslationsInsert,
			})
		// );
	};

};

export default collection;
