import Logger from '@server/functions/logger';
import alternative_title from '../shared/alternative_title';
import collection from './collection';
import colorPalette from '@server/functions/colorPalette';
// import createBlurHash from '@server/functions/createBlurHash';
import { createTitleSort } from '../../files/filenameParser';
import fetchMovie from './fetchMovie';
import findMediaFiles from '../files';
import genre from '../shared/genre';
import i18n from '../../../loaders/i18n';
import keyword from '../shared/keyword';
import person from '../shared/person';
import recommendation from '../shared/recommendation';
import similar from '../shared/similar';
import translation from '../shared/translation';
import { insertMovie } from '@server/db/media/actions/movies';
import cast from '../shared/cast';
import crew from '../shared/crew';
import { insertMedia } from '@server/db/media/actions/medias';
import { insertCertificationMovie } from '@server/db/media/actions/certification_movie';
import { insertCertification, selectCertification } from '@server/db/media/actions/certifications';
import { and, eq } from 'drizzle-orm';
import { certifications } from '@server/db/media/schema/certifications';
import { insertLibraryMovie } from '@server/db/media/actions/library_movie';
import { QueueJob } from '@server/db/queue/schema/queueJobs';
import { parseYear } from '@server/functions/dateTime';
import { image } from '@server/tasks/data/shared/image';
import downloadTVDBImages from '@server/tasks/images/downloadTVDBImages';
// import { existsSync } from 'fs';

export const storeMovie = async ({
	id,
	folder,
	libraryId,
	job,
	task = { id: 'manual' },
}:
	{ id: number; folder: string, libraryId: string, job?: QueueJob, task?: { id: string; }; }) => {

	console.log({
		id,
		folder,
		libraryId,
		job,
		task,
	});
	// if (!existsSync(folder)) {
	// 	return {
	// 		success: false,
	// 		error: `Folder ${folder}does not exist`,
	// 	};
	// }

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

		const transaction: any[] = [];

		const alternativeTitlesInsert: any[] = [];
		const castInsert: any[] = [];
		const crewInsert: any[] = [];
		const genresInsert: any[] = [];
		const keywordsInsert: any[] = [];

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			movie.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${movie.poster_path}`)
				.then((hash) => {
					palette.poster = hash;
				}),
			movie.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${movie.backdrop_path}`)
				.then((hash) => {
					palette.backdrop = hash;
				}),
		]);

		try {
			insertMovie({
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
				color_palette: JSON.stringify(palette),
				releaseDate: movie.release_date,
				revenue: isNaN(movie.revenue / 1000)
					?					null
					:					Math.floor(movie.revenue / 1000),
				runtime: movie.runtime,
				status: movie.status,
				tagline: movie.tagline,
				title: movie.title,
				titleSort: createTitleSort(movie.title, parseYear(movie.release_date)),
				video: movie.video.toString(),
				voteAverage: movie.vote_average,
				voteCount: movie.vote_count,
				folder: folder.replace(/.*[\\\/](.*)/u, '/$1'),
				library_id: libraryId,
			});

			insertLibraryMovie({
				library_id: libraryId,
				movie_id: movie.id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['movie', error]),
			});
			return {
				success: false,
				message: `Something went wrong adding ${movie.title}`,
				error: error,
			};
		}

		await person(movie, transaction);

		const people = (movie.people).map(p => p.id);

		genre(movie, genresInsert, 'movie');

		alternative_title(movie, alternativeTitlesInsert, 'movie');
		keyword(movie, transaction, keywordsInsert, 'movie');

		cast(movie, castInsert, people, 'movie');
		crew(movie, crewInsert, people, 'movie');

		if (movie.belongs_to_collection) {
			await collection(movie, libraryId);
		}

		translation(movie, transaction, 'movie');

		await recommendation(movie, transaction, 'movie');
		await similar(movie, transaction, 'movie');

		for (const video of movie.videos.results) {
			try {
				insertMedia({
					iso6391: video.iso_639_1,
					name: video.name,
					site: video.site,
					size: video.size,
					src: video.key,
					type: video.type,
					movie_id: movie.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['movie media', error]),
				});
			}
		}

		for (const rating of movie.release_dates?.results ?? []) {
			for (const rate of rating.release_dates) {

				try {
					const certs = selectCertification({
						where: and(
							eq(certifications.iso31661, rating.iso_3166_1),
							eq(certifications.rating, rate.certification)
						),
					});

					const cert = certs.map(c => insertCertification({
						iso31661: rating.iso_3166_1,
						meaning: c!.meaning,
						order: c!.order,
						rating: rate.certification,
					}));

					cert.map(c => insertCertificationMovie({
						iso31661: rating.iso_3166_1,
						movie_id: movie.id,
						certification_id: c.id,
					}));

				} catch (error) {
					Logger.log({
						level: 'error',
						name: 'App',
						color: 'red',
						message: JSON.stringify(['tv certification', error]),
					});
				}
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

		image(movie, 'backdrop', 'movie');
		image(movie, 'logo', 'movie');
		image(movie, 'poster', 'movie');

		downloadTVDBImages({
			type: 'movie',
			data: movie,
		});

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Committing data to the database for: ${movie.title}`,
		});

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Searching media files for: ${movie.title}`,
		});

		if (folder) {
			await findMediaFiles({
				type: 'movie',
				data: movie,
				folder,
				libraryId,
				sync: false,
			});

			process.send?.({
				type: 'custom',
				event: 'update_content',
				data: ['libraries', libraryId],
			});
		}


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
				message: JSON.stringify([`${__filename}`, error]),
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
