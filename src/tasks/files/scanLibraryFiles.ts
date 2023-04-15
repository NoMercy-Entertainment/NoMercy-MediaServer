import { Prisma } from '../../database/config/client';
import { confDb } from '../../database/config';
import FileList from './getFolders';
import Logger from '../../functions/logger';
import { jsonToString } from '../../functions/stringArray';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { cachePath } from '../../state';
import { fileChangedAgo, humanTime } from '../../functions/dateTime';
import { getExistingSubtitles } from '../../functions/ffmpeg/subtitles/subtitle';
import { getQualityTag } from '../../functions/ffmpeg/quality/quality';
import { ParsedFileList } from './filenameParser';
import { VideoFFprobe } from 'encoder/ffprobe/ffprobe';

export default () => {
	return new Promise((resolve, reject) => {
		try {
			confDb.folder
				.findMany({
					include: {
						Libraries: {
							include: {
								library: true,
							},
						},
					},
					// where: {
					// 	Libraries: {
					// 		some: {
					// 			libraryId: 'cl7i4km1o0006qwefdx5neusi',
					// 		}
					// 	}
					// }
				})
				.then(async (folders) => {

					for (const folder of folders) {
						await FileList({
							folder: folder.path,
							recursive: true,
						}).then(async (fileList) => {

							const promises: Prisma.PromiseReturnType<any>[] = [];

							const folderFile = path.join(cachePath, 'temp', `${folder.path.replace(/[\\\/:]/gu, '_')}_parsed.json`);

							let parsedFiles: ParsedFileList[] = new Array<ParsedFileList>();

							if (existsSync(folderFile) && fileChangedAgo(folderFile, 'days') < 50 && JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0) {
								parsedFiles = parsedFiles.sort((a, b) => b.name.localeCompare(a.name));
								parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'));
							} else {
								parsedFiles = await fileList.getParsedFiles(folder.Libraries[0].library?.type == 'tv');
								parsedFiles = parsedFiles.sort((a, b) => b.name.localeCompare(a.name));
								writeFileSync(folderFile, jsonToString(parsedFiles));
							}

							for (const file of parsedFiles) {

								const movieId = (await confDb.movie.findFirst({
									where: {
										folder: file.folder,
									},
								}))?.id;
								// console.log(movieId);

								const episodeId = (await confDb.episode.findFirst({
									where: {
										Tv: {
											folder: file.folder,
										},
										seasonNumber: file.seasons[0],
										episodeNumber: file.episodeNumbers[0],
									},
								}))?.id;

								const newFile: Prisma.FileCreateWithoutMovieInput = Object.keys(file)
									.filter(key => !['seasons', 'episodeNumbers'].includes(key))
									.reduce((obj, key) => {
										obj[key] = file[key];
										return obj;
									}, <Prisma.FileCreateWithoutMovieInput>{});

								const insertData = {
									...newFile,
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
											id: folder.Libraries[0].libraryId,
										},
									},
									Movie: {
										connect: {
											id: movieId,
										},
									},
									Episode: {
										connect: {
											id: episodeId,
										},
									},
								};

								if (!movieId) {
									// @ts-expect-error
									delete insertData.Movie;
								}
								if (!episodeId) {
									// @ts-expect-error
									delete insertData.Episode;
								}
								// if(!(insertData.Movie ?? insertData.Episode)){
								// console.log(insertData);
								// }

								// promises.push(
								await	confDb.file.upsert({
									where: {
										path_libraryId: {
											libraryId: folder.Libraries[0].libraryId,
											path: file.path,
										},
									},
									create: insertData,
									update: insertData,
								});
								// );

								if (file.ffprobe?.format && (movieId || episodeId)) {
									const videoFileInset = Prisma.validator<Prisma.VideoFileUncheckedUpdateInput>()({
										filename: file.ffprobe.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
										folder: file.episodeFolder!,
										hostFolder: file.ffprobe.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
										duration: humanTime(file.ffprobe.format.duration),
										episodeId: episodeId,
										movieId: movieId,
										quality: JSON.stringify(getQualityTag(file.ffprobe)),
										share: folder.Libraries[0].libraryId,
										subtitles: JSON.stringify(getExistingSubtitles((file.ffprobe as VideoFFprobe))),
										languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
										Chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
									});

									// promises.push(
									await	confDb.videoFile.upsert({
										where: {
											episodeId: episodeId,
											movieId: movieId,
										},
										create: videoFileInset,
										update: videoFileInset,
									});
									// );
								}
							}
							confDb.$transaction(promises);
						});
					}

					Logger.log({
						level: 'info',
						name: 'job',
						color: 'magentaBright',
						message: 'Files table updated',
					});
					resolve;
				});
		} catch (error) {
			reject(error);
		}
	});
};
