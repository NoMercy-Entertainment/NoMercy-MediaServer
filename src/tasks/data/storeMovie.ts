import { AppState, useSelector } from '@/state/redux';

import Logger from '../../functions/logger';
import Person from '../../providers/tmdb/people';
import { Prisma } from '../../database/config/client';
import { QueueJob } from '../../database/queue/client';
import alternative_title from './alternative_title';
import cast from './cast';
import collection from './collection';
import colorPalette from '@/functions/colorPalette';
import { confDb } from '../../database/config';
import createBlurHash from '../../functions/createBlurHash';
import { createTitleSort } from '../files/filenameParser';
import crew from './crew';
import downloadTVDBImages from '../images/downloadTVDBImages';
import fetchMovie from './fetchMovie';
import findMediaFiles from './files';
import genre from './genre';
import i18n from '../../loaders/i18n';
import { image } from './image';
import keyword from './keyword';
import person from './person';
import recommendation from './recommendation';
import similar from './similar';
import translation from './translation';

export const storeMovie = async ({ id, folder, libraryId, job, task = { id: 'manual' } }:
	{ id: number; folder: string, libraryId: string, job?: QueueJob, task?: { id: string; }; }) => {
	console.log({ id, folder, libraryId, job, task });
	await i18n.changeLanguage('en');

	const movie = await fetchMovie(id);
	if (!movie) {
		return;
	}
	try {

		if (!job || (job?.payload && !JSON.parse(job?.payload as string).error)) {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: `Adding Movie: ${movie.title}`,
			});
		}

		const transaction: Prisma.PromiseReturnType<any>[] = [];

		const alternativeTitlesInsert: Array<Prisma.AlternativeTitlesCreateOrConnectWithoutMovieInput> = [];
		const castInsert: Array<Prisma.CastCreateOrConnectWithoutMovieInput> = [];
		const crewInsert: Array<Prisma.CrewCreateOrConnectWithoutMovieInput> = [];
		const genresInsert: Array<Prisma.GenreMovieCreateOrConnectWithoutMovieInput> = [];
		const keywordsInsert: Array<Prisma.KeywordMovieCreateOrConnectWithoutMovieInput> = [];

		await person(movie, transaction);

		const people = (movie.people as unknown as Person[]).map(p => p.id) as unknown as number[];

		await genre(movie, genresInsert, 'movie');
		await alternative_title(movie, alternativeTitlesInsert, 'movie');
		await keyword(movie, transaction, keywordsInsert, 'movie');

		await cast(movie, castInsert, people, 'movie');
		await crew(movie, crewInsert, people, 'movie');

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			movie.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${movie.poster_path}`).then((hash) => {
				blurHash.poster = hash;
			}),
			movie.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${movie.backdrop_path}`).then((hash) => {
				blurHash.backdrop = hash;
			}),
			movie.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${movie.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
			movie.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${movie.backdrop_path}`).then((hash) => {
				palette.backdrop = hash;
			}),
		]);
		// @ts-ignore
		const movieInsert = Prisma.validator<Prisma.MovieUncheckedCreateInput>()({
			adult: movie.adult,
			backdrop: movie.backdrop_path,
			budget: movie.budget,
			homepage: movie.homepage,
			id: movie.id,
			imdbId: movie.external_ids?.imdb_id,
			tvdbId: movie.external_ids?.tvdb_id,
			originalLanguage: movie.original_language,
			originalTitle: movie.original_title,
			overview: movie.overview,
			popularity: movie.popularity,
			poster: movie.poster_path,
			blurHash: JSON.stringify(blurHash),
			colorPalette: JSON.stringify(palette),
			releaseDate: movie.release_date,
			revenue: isNaN(movie.revenue / 1000)
				? null
				: Math.floor(movie.revenue / 1000),
			runtime: movie.runtime,
			status: movie.status,
			tagline: movie.tagline,
			title: movie.title,
			titleSort: createTitleSort(movie.title, movie.release_date),
			video: movie.video.toString(),
			voteAverage: movie.vote_average,
			voteCount: movie.vote_count,
			folder: folder.replace(/.*[\\\/](.*)/u, '/$1'),
			Genre: {
				connectOrCreate: genresInsert,
			},
			AlternativeTitles: {
				connectOrCreate: alternativeTitlesInsert,
			},
			Cast: {
				connectOrCreate: castInsert,
			},
			Crew: {
				connectOrCreate: crewInsert,
			},
			Keyword: {
				connectOrCreate: keywordsInsert,
			},
			libraryId: libraryId,
		});

		// transaction.push(
		await confDb.movie.upsert({
			where: {
				id: movie.id,
			},
			create: movieInsert,
			update: movieInsert,
		});
		// );

		if (movie.belongs_to_collection) {
			await collection(movie, libraryId, transaction);
		}

		await translation(movie, transaction, 'movie');

		await recommendation(movie, transaction, 'movie');
		await similar(movie, transaction, 'movie');

		for (const video of movie.videos.results) {
			const mediaInsert: Prisma.MediaUncheckedCreateInput = {
				iso6391: video.iso_639_1,
				name: video.name,
				site: video.site,
				size: video.size,
				src: video.key,
				type: video.type,
				movieId: movie.id,
			};

			// transaction.push(
			await confDb.media.upsert({
				where: {
					src: video.key,
				},
				update: mediaInsert,
				create: mediaInsert,
			});
			// );
		}

		for (const rating of movie.release_dates?.results ?? []) {
			for (const rate of rating.release_dates) {

				const cert = await confDb.certification.findFirst({
					where: {
						iso31661: rating.iso_3166_1,
						rating: rate.certification,
					},
				});

				if (!cert) {
					continue;
				}

				const movieRatingsInsert: Prisma.CertificationMovieUncheckedCreateInput = {
					iso31661: rating.iso_3166_1,
					movieId: movie.id,
					certificationId: cert.id,
				};

				// transaction.push(
				await confDb.certificationMovie.upsert({
					where: {
						movieId_iso31661: {
							iso31661: rating.iso_3166_1,
							movieId: movie.id,
						},
					},
					create: movieRatingsInsert,
					update: movieRatingsInsert,
				});
				// );
			}
		}

		// TODO: this
		// const productionCompaniesInsert = m.production_companies.map(p => {
		//   return {
		//     id: p.id,
		// 		logo: p.logo_path,
		// 		name: p.name,
		// 		origin_country: p.origin_country,
		//   }
		// });
		// transaction.push(confDb.company.upsert({
		//   where: { id },
		//   update: productionCompaniesInsert,
		//   create: productionCompaniesInsert,
		// });)

		// const productionCountriesInsert = m.production_countries.map(p => {
		//   return {
		//     iso_3166_1: p.iso_3166_1,
		//   }
		// });

		// transaction.push(confDb.productionCountries.upsert({
		//   where: { id },
		//   update: productionCountriesInsert,
		//   create: productionCountriesInsert,
		// }));

		await image(movie, transaction, 'backdrop', 'movie');
		await image(movie, transaction, 'logo', 'movie');
		await image(movie, transaction, 'poster', 'movie');

		await downloadTVDBImages({ type: 'movie', data: movie });

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Committing data to the database for: ${movie.title}`,
		});

		await confDb.$transaction(transaction);

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Searching media files for: ${movie.title}`,
		});

		await findMediaFiles({ type: 'movie', data: movie, folder, libraryId, sync: true });

		const socket = useSelector((state: AppState) => state.system.socket);
		socket.emit('update_content', ['library']);

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Movie: ${movie.title} added successfully`,
		});

		return {
			success: true,
			message: `Movie: ${movie.title} added successfully`,
			data: movie,
		};
	} catch (error: any) {
		if (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(error),
			});
		}

		return {
			success: false,
			message: `Something went wrong adding ${movie.title}`,
			error: error,
		};
	}

};

export default storeMovie;
