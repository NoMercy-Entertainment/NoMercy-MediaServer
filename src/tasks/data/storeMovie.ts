import { Jobs, Prisma } from '../../database/config/client';
import { join, resolve } from 'path';
import {
	existsSync,
	readFileSync,
	writeFileSync
} from 'fs';
import { VideoFFprobe } from 'encoder/ffprobe/ffprobe';

import alternative_title from './alternative_title';
import cast from './cast';
import collection from './collection';
import crew from './crew';
import fetchMovie from './fetchMovie';
import FileList from '../files/getFolders';
import genre from './genre';
import image from './image';
import keyword from './keyword';
import Logger from '../../functions/logger';
import person from './person';
import recommendation from './recommendation';
import similar from './similar';
import translation from './translation';
import { confDb } from '../../database/config';
import {
	createTitleSort,
	ParsedFileList
} from '../../tasks/files/filenameParser';
import { cachePath } from '../../state';
import {
	fileChangedAgo,
	humanTime
} from '../../functions/dateTime';
import { jsonToString } from '../../functions/stringArray';
import {
	getQualityTag
} from '../../functions/ffmpeg/quality/quality';
import {
	getExistingSubtitles
} from '../../functions/ffmpeg/subtitles/subtitle';

import i18n from '../../loaders/i18n';
import { AppState, useSelector } from '../../state/redux';
import createBlurHash from '../../functions/createBlurHash/createBlurHash';

export const storeMovie = async ({ id, folder, libraryId, job, task = { id: 'manual' } }: { id: number; folder: string, libraryId: string, job?: Jobs, task?: { id: string } }) => {
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

		const alternativeTitlesInsert: any[] = [];
		const castInsert: any[] = [];
		const collectionInsert: any[] = [];
		const crewInsert: any[] = [];
		const genresInsert: any[] = [];
		const keywordsInsert: any[] = [];
		const personPromise: Promise<any>[] = [];

		await person(movie, transaction);

		const people = await confDb.person.findMany({
			select: {
				id: true,
			},
		}).then(d => d.map(e => e.id));

		if (movie.belongs_to_collection) {
			await collection(movie, libraryId, transaction, collectionInsert);
		}

		await genre(movie, genresInsert, 'movie');
		await alternative_title(movie, alternativeTitlesInsert, 'movie');
		await cast(movie, transaction, castInsert, people);
		await crew(movie, transaction, crewInsert, people);
		await keyword(movie, transaction, keywordsInsert, 'movie');

		const blurHash = {
			poster: movie.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${movie.poster_path}`)
				: undefined,
			backdrop: movie.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${movie.backdrop_path}`)
				: undefined,
		};

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
			CollectionMovie: {
				connectOrCreate: collectionInsert,
			},
			libraryId: libraryId,
		});

		await Promise.all(personPromise);

		transaction.push(
			confDb.movie.upsert({
				where: {
					id: movie.id,
				},
				create: movieInsert,
				update: movieInsert,
			})
		);

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

			transaction.push(
				confDb.media.upsert({
					where: {
						src: video.key,
					},
					update: mediaInsert,
					create: mediaInsert,
				})
			);
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

				transaction.push(
					confDb.certificationMovie.upsert({
						where: {
							movieId_iso31661: {
								iso31661: rating.iso_3166_1,
								movieId: movie.id,
							},
						},
						create: movieRatingsInsert,
						update: movieRatingsInsert,
					})
				);
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

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Adding recommendations and similar for: ${movie.title}`,
		});

		await recommendation(movie, transaction, 'movie');
		await similar(movie, transaction, 'movie');
		await translation(movie, transaction, 'movie');

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Adding images for: ${movie.title}`,
		});

		await image(movie, transaction, 'backdrop', 'movie');
		await image(movie, transaction, 'logo', 'movie');
		await image(movie, transaction, 'poster', 'movie');

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
			message: `Finding all usable files for: ${movie.title}`,
		});

		await FileList({
			folder: folder,
			recursive: true,
		}).then(async (fileList) => {

			const fileTransaction: Prisma.PromiseReturnType<any>[] = [];

			const folderFile = join(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);

			let parsedFiles: ParsedFileList[];
			if (existsSync(folderFile) && fileChangedAgo(folderFile, 'days') < 50 && JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0) {
				parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'));
			} else {
				parsedFiles = await fileList.getParsedFiles();
				writeFileSync(folderFile, jsonToString(parsedFiles));
			}

			for (const file of parsedFiles) {

				const movie = (await confDb.movie.findFirst({
					where: {
						folder: file.folder,
					},
				}));

				const newFile: Prisma.FileCreateWithoutEpisodeInput = Object.keys(file)
					.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'artistFolder', 'musicFolder'].includes(key))
					.reduce((obj, key) => {
						obj[key] = file[key];
						return obj;
					}, <Prisma.FileCreateWithoutEpisodeInput>{});

				// @ts-ignore
				const insertData = Prisma.validator<Prisma.FileCreateWithoutEpisodeInput>()({
					...newFile,
					year: file.year
						? typeof file.year == 'string'
							? parseInt(file.year, 10)
							: file.year
						: undefined,
					sources: JSON.stringify(file.sources),
					revision: JSON.stringify(file.revision),
					languages: JSON.stringify(file.languages),
					edition: JSON.stringify(file.edition),
					ffprobe: file.ffprobe
						? JSON.stringify(file.ffprobe)
						: null,
					chapters: (file.ffprobe as VideoFFprobe)?.chapters
						? JSON.stringify((file.ffprobe as VideoFFprobe)?.chapters)
						: null,
					Library: {
						connect: {
							id: libraryId,
						},
					},
					Movie: {
						connect: {
							id: id,
						},
					},
				});

				fileTransaction.push(
					confDb.file.upsert({
						where: {
							path_libraryId: {
								libraryId: libraryId,
								path: file.path,
							},
						},
						create: insertData,
						update: insertData,
					})
				);

				if (file.ffprobe?.format && movie) {
					const videoFileInset = Prisma.validator<Prisma.VideoFileUpdateInput>()({
						filename: file.ffprobe.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
						folder: file.folder,
						hostFolder: file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
						duration: humanTime(file.ffprobe.format.duration),
						quality: JSON.stringify(getQualityTag(file.ffprobe)),
						share: libraryId,
						subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1/subtitles'))),
						languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
						Chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
						Movie: {
							connect: {
								id: id,
							},
						},
					});

					fileTransaction.push(
						confDb.videoFile.upsert({
							where: {
								movieId: id,
							},
							create: videoFileInset,
							update: videoFileInset,
						})
					);
				}
			}

			await confDb.$transaction(fileTransaction);


		});

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Dispatching image processing job for: ${movie.title}`,
		});

		const queue = useSelector((state: AppState) => state.config.dataWorker);

		await queue.add({
			file: resolve(__dirname, '..', 'images', 'downloadTVDBImages'),
			fn: 'downloadTVDBImages',
			args: { type: 'movie', task, data: { ...movie, task } },
		});

		await queue.add({
			file: resolve(__dirname, '..', 'images', 'downloadTMDBImages'),
			fn: 'downloadTMDBImages',
			args: { type: 'movie', task, data: { ...movie, task } },
		});

		// await downloadTVDBImages({ type: 'movie', data: { ...movie, task } }).catch((e) => console.log(e));
		// await downloadTMDBImages({ type: 'movie', data: { ...movie, task } }).catch((e) => console.log(e));

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
