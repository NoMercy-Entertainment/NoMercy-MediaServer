import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { checkDbLock } from '../../database';
import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import { fileChangedAgo, humanTime } from '../../functions/dateTime';
import { getQualityTag } from '../../functions/ffmpeg/quality/quality';
import { getExistingSubtitles } from '../../functions/ffmpeg/subtitles/subtitle';
import Logger from '../../functions/logger';
import { jsonToString } from '../../functions/stringArray';
import { cachePath } from '@/state';
import { AppState, useSelector } from '@/state/redux';
import { ParsedFileList } from '../../tasks/files/filenameParser';
import FileList from '../../tasks/files/getFolders';

import type { VideoFFprobe } from '../../encoder/ffprobe/ffprobe';
export const execute = async ({ data, folder, libraryId, type }) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Finding all usable files for: ${data.title ?? data.name}`,
	});

	console.log({ id: data.id, folder, libraryId, type });

	if (folder) {

		if (type === 'movie') {
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
								id: data.id,
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
							subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe as VideoFFprobe)),
							languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
							Chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
							Movie: {
								connect: {
									id: data.id,
								},
							},
						});

						fileTransaction.push(
							confDb.videoFile.upsert({
								where: {
									movieId: data.id,
								},
								create: videoFileInset,
								update: videoFileInset,
							})
						);
					}
				}
				await confDb.$transaction(fileTransaction);
			});
		} else {
			let haveEpisodes = 0;
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

					if (file.episodeNumbers?.[0] === undefined && file.episodeNumbers?.[0] === null) {
						continue;
					}

					const episode = await confDb.episode.findFirst({
						where: {
							Tv: {
								folder: file.folder,
							},
							seasonNumber: (file.seasons?.[0] ?? 1),
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

						if ((file.seasons?.[0] ?? 1) > 0) {
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
							seasonNumber: (file.seasons?.[0] ?? 1),
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

						if (file.ffprobe?.format && (file.ffprobe as VideoFFprobe).streams?.video) {
							const videoFileInset = Prisma.validator<Prisma.VideoFileUpdateInput>()({
								filename: file.ffprobe.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
								folder: file.folder + file.episodeFolder!,
								hostFolder: file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
								duration: humanTime(file.ffprobe.format.duration),
								quality: JSON.stringify(getQualityTag(file.ffprobe)),
								share: libraryId,
								subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe as VideoFFprobe)),
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
							id: data.id,
						},
						data: {
							haveEpisodes: haveEpisodes,
						},
					})
				);

				while (await checkDbLock()) {
					//
				}
				await confDb.$transaction(fileTransaction).catch(e => console.log(e));
			});
		}
	}

	return {
		success: true,
	};
};

const findMediaFiles = async ({ data, folder, libraryId, type, sync = false }) => {
	if (sync) {
		return await execute({ data, folder, libraryId, type });
	}
	const queue = useSelector((state: AppState) => state.config.queueWorker);

	await queue.add({
		file: __filename,
		fn: 'execute',
		args: { data, folder, libraryId, type },
	});
};

export default findMediaFiles;
