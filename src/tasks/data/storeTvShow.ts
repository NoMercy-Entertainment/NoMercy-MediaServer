import axios from 'axios';
import { Jobs, Prisma } from '@prisma/client';
import {
	existsSync,
	readFileSync,
	writeFileSync
} from 'fs';
import { VideoFFprobe } from 'encoder/ffprobe/ffprobe';
import { join, resolve } from 'path';

import alternative_title from './alternative_title';
import cast from './cast';
import creator from './creator';
import crew from './crew';
import fetchTvShow from './fetchTvShow';
import FileList from '../../tasks/files/getFolders';
import genre from './genre';
// import image from './image';
import keyword from './keyword';
import Logger from '../../functions/logger';
// import person from './person';
// import recommendation from './recommendation';
// import season from './season';
// import similar from './similar';
// import translation from './translation';
import {
	createTitleSort,
	ParsedFileList
} from '../../tasks/files/filenameParser';
import {
	fileChangedAgo,
	humanTime,
	parseYear
} from '../../functions/dateTime';
import { cachePath } from '../../state';
import { confDb } from '../../database/config';
import {
	getExistingSubtitles
} from '../../functions/ffmpeg/subtitles/subtitle';
import {
	getQualityTag
} from '../../functions/ffmpeg/quality/quality';
import { jsonToString } from '../../functions/stringArray';

import i18n from '../../loaders/i18n';
import { AppState, useSelector } from '../../state/redux';
import createBlurHash from '../../functions/createBlurHash';
import person from './person';
import image from './image';
import recommendation from './recommendation';
import season from './season';
import similar from './similar';
import translation from './translation';

export const storeTvShow = async ({ id, folder, libraryId, job, task = { id: 'manual' } }: { id: number; folder?: string, libraryId: string, job?: Jobs, task?: { id: string } }) => {
	console.log({ id, folder, libraryId, job, task });
	await i18n.changeLanguage('en');

	const tv = await fetchTvShow(id);
	if (!tv) {
		return;
	}

	try {
		const transaction: Prisma.PromiseReturnType<any>[] = [];

		const castInsert: any[] = [];
		const crewInsert: any[] = [];
		const createdByInsert: any[] = [];
		const keywordsInsert: any[] = [];
		const alternativeTitlesInsert: any[] = [];
		const genresInsert: any[] = [];

		let Type = 'tv';

		if (!job || (job?.payload && !JSON.parse(job?.payload as string).error)) {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: `Adding TV Show: ${tv.name}`,
			});
		}

		genre(tv, genresInsert, 'tv');

		await person(tv, transaction);

		const people = await confDb.person.findMany({
			select: {
				id: true,
			},
		}).then(d => d.map(e => e.id));

		await creator(tv, transaction, createdByInsert, people);
		await cast(tv, transaction, castInsert, people);
		await crew(tv, transaction, crewInsert, people);
		await alternative_title(tv, alternativeTitlesInsert, 'tv');
		await keyword(tv, transaction, keywordsInsert, 'tv');

		const year = parseYear(tv.first_air_date);

		let duration: number | null = null;
		const Duration: number = Math.round(tv.episode_run_time.reduce((ert, c) => ert + c, 0) / tv.episode_run_time.length);

		if (!isNaN(Duration) && tv.episode_run_time.length > 0) {
			duration = Duration;
		}

		await axios
			.get(`https://kitsu.io/api/edge/anime?filter[text]=${tv.name}&filter[year]=${year}`, {
				timeout: 2000,
			})
			.then((response) => {
				for (const data of response.data.data) {
					if (data.attributes.titles.en?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					} else if (data.attributes.titles.en_jp?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					} else if (data.attributes.titles.en_us?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					}
				}
			})
			.catch(e => console.log(e));

		const blurHash = {
			poster: tv.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${tv.poster_path}`)
				: undefined,
			backdrop: tv.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${tv.backdrop_path}`)
				: undefined,
		};

		const tvInsert = Prisma.validator<Prisma.TvUncheckedCreateInput>()({
			backdrop: tv.backdrop_path,
			duration: duration,
			firstAirDate: tv.first_air_date,
			homepage: tv.homepage,
			id: tv.id,
			imdbId: tv.external_ids?.imdb_id,
			tvdbId: tv.external_ids?.tvdb_id,
			inProduction: tv.in_production,
			lastEpisodeToAir: tv.last_episode_to_air?.id,
			mediaType: Type,
			nextEpisodeToAir: tv.next_episode_to_air?.id,
			numberOfEpisodes: tv.number_of_episodes,
			numberOfSeasons: tv.number_of_seasons,
			originCountry: tv.origin_country.join(', '),
			originalLanguage: tv.original_language,
			overview: tv.overview,
			popularity: tv.popularity,
			poster: tv.poster_path,
			blurHash: JSON.stringify(blurHash),
			spokenLanguages: tv.spoken_languages.map(sl => sl.iso_639_1).join(', '),
			status: tv.status,
			tagline: tv.tagline,
			title: tv.name,
			titleSort: createTitleSort(tv.name, tv.first_air_date),
			type: tv.type,
			voteAverage: tv.vote_average,
			voteCount: tv.vote_count,
			folder: folder?.replace(/.*[\\\/](.*)/u, '/$1'),
			libraryId: libraryId,
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
			Creator: {
				connectOrCreate: createdByInsert,
			},
		});

		transaction.push(
			confDb.tv.upsert({
				where: {
					id: tv.id,
				},
				update: tvInsert,
				create: tvInsert,
			})
		);

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Adding recommendations and similar for: ${tv.name}`,
		});

		await recommendation(tv, transaction, 'tv');
		await similar(tv, transaction, 'tv');
		await translation(tv, transaction, 'tv');

		await season(tv, transaction, people, task);

		for (const video of tv.videos.results) {
			const mediaInsert = Prisma.validator<Prisma.MediaUncheckedCreateInput>()({
				iso6391: video.iso_639_1,
				name: video.name,
				site: video.site,
				size: video.size,
				src: video.key,
				type: video.type,
				tvId: tv.id,
			});

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

		for (const content_rating of tv.content_ratings.results || []) {
			const cert = await confDb.certification.findFirst({
				where: {
					iso31661: content_rating.iso_3166_1,
					rating: content_rating.rating,
				},
			});

			if (!cert) continue;

			const tvRatingsInsert = Prisma.validator<Prisma.CertificationTvUncheckedCreateInput>()({
				iso31661: content_rating.iso_3166_1,
				tvId: tv.id,
				certificationId: cert.id,
			});

			transaction.push(
				confDb.certificationTv.upsert({
					where: {
						tvId_iso31661: {
							iso31661: content_rating.iso_3166_1,
							tvId: tv.id,
						},
					},
					create: tvRatingsInsert,
					update: tvRatingsInsert,
				})
			);
		}

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Adding images for: ${tv.name}`,
		});

		await image(tv, transaction, 'backdrop', 'tv');
		await image(tv, transaction, 'logo', 'tv');
		await image(tv, transaction, 'poster', 'tv');

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Committing data to the dta base for: ${tv.name}`,
		});
		await confDb.$transaction(transaction).catch(e => console.log(e));

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Finding all usable files for: ${tv.name}`,
		});

		let haveEpisodes = 0;

		if (folder) {
			await FileList({
				folder: folder,
				recursive: true,
			}).then(async (fileList) => {
				const fileTransaction: Prisma.PromiseReturnType<any>[] = [];

				const folderFile = join(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);
				// console.log(folderFile);

				let parsedFiles: ParsedFileList[];
				if (existsSync(folderFile) && fileChangedAgo(folderFile, 'days') < 50 && JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0) {
					parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'));
				} else {
					parsedFiles = await fileList.getParsedFiles(true);
					writeFileSync(folderFile, jsonToString(parsedFiles));
				}

				for (const file of parsedFiles) {

					if (!file.seasons?.[0] || !file.episodeNumbers?.[0]) {
						continue;
					}

					const episode = await confDb.episode.findFirst({
						where: {
							Tv: {
								folder: file.folder,
							},
							seasonNumber: file.seasons[0],
							episodeNumber: file.episodeNumbers[0],
						},
					});

					if (episode?.id) {
						const newFile: Prisma.FileCreateWithoutMovieInput = Object.keys(file)
							.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'artistFolder', 'musicFolder'].includes(key))
							.reduce((obj, key) => {
								obj[key] = file[key];
								return obj;
							}, <Prisma.FileCreateWithoutMovieInput>{});

						if (file.seasons[0] > 0) {
							haveEpisodes += 1;
						}

						// @ts-ignore
						const insertData = Prisma.validator<Prisma.FileCreateWithoutMovieInput>()({
							...newFile,
							episodeFolder: file.episodeFolder as string,
							name: `/${file.name}` as string,
							year: file.year
								? parseInt(file.year.toString(), 10)
								: null,
							sources: JSON.stringify(file.sources),
							revision: JSON.stringify(file.revision),
							languages: JSON.stringify(file.languages),
							edition: JSON.stringify(file.edition),
							seasonNumber: file.seasons[0],
							episodeNumber: file.episodeNumbers[0],
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
							Episode: {
								connect: {
									id: episode.id,
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

						if (file.ffprobe?.format && insertData.extension != '.mkv') {
							const videoFileInset = Prisma.validator<Prisma.VideoFileUpdateInput>()({
								filename: file.ffprobe.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
								folder: file.folder + file.episodeFolder!,
								hostFolder: file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
								duration: humanTime(file.ffprobe.format.duration),
								quality: JSON.stringify(getQualityTag(file.ffprobe)),
								share: libraryId,
								subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1/subtitles'))),
								languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
								Chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
								Episode: {
									connect: {
										id: episode?.id,
									},
								},
							});

							fileTransaction.push(
								confDb.videoFile.upsert({
									where: {
										episodeId: episode?.id,
									},
									create: videoFileInset,
									update: videoFileInset,
								})
							);
						}
					}
				}

				fileTransaction.push(
					confDb.tv.update({
						where: {
							id: tv.id,
						},
						data: {
							haveEpisodes: haveEpisodes,
						},
					})
				);

				await confDb.$transaction(fileTransaction).catch(e => console.log(e));


			});
		}

		const queue = useSelector((state: AppState) => state.config.dataWorker);

		await queue.add({
			file: resolve(__dirname, '..', 'images', 'downloadTVDBImages'),
			fn: 'downloadTVDBImages',
			args: { type: 'tv', task, data: { ...tv, task } },
		});

		await queue.add({
			file: resolve(__dirname, '..', 'images', 'downloadTMDBImages'),
			fn: 'downloadTMDBImages',
			args: { type: 'tv', task, data: { ...tv, task } },
		});

		// await downloadTVDBImages({ type: 'tv', data: { ...tv, task } });
		// await downloadTMDBImages({ type: 'tv', data: { ...tv, task } });

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `TV Show: ${tv.name} added successfully`,
		});

		return {
			success: true,
			message: `TV Show: ${tv.name} added successfully`,
			data: tv,
		};

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'red',
			message: JSON.stringify(error),
		});

		return {
			success: false,
			message: `Something went wrong adding ${tv.name}`,
			error: error,
		};
	}

};

export default storeTvShow;
