import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { fileChangedAgo, humanTime } from '@server/functions/dateTime';
import Logger from '@server/functions/logger';
import { jsonToString } from '@server/functions/stringArray';
import { cachePath } from '@server/state';
import { ParsedFileList } from '../../../tasks/files/filenameParser';
import FileList from '../../../tasks/files/getFolders';

import type { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import { File, insertFileDB } from '@server/db/media/actions/files';
import { insertVideoFileDB } from '@server/db/media/actions/videoFiles';
import { getQualityTag } from '@server/functions/ffmpeg/quality/quality';
import { getExistingSubtitles } from '@server/functions/ffmpeg/subtitles/subtitle';
import { updateTv } from '@server/db/media/actions/tvs';
import { getEpisodeDB } from '@server/db/media/actions/episodes';
import { findFoldersDB } from '@server/db/media/actions/folders';

export default async ({ data, folder, libraryId }) => {

	return await FileList({
		folder: folder,
		recursive: true,
	}).then(async (fileList) => {

		const folderFile = resolve(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);

		let parsedFiles: ParsedFileList[];
		if (existsSync(folderFile) && fileChangedAgo(folderFile, 'minutes') < 2 && JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0) {
			parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'));
		} else {
			parsedFiles = await fileList.getParsedFiles(true);
			writeFileSync(folderFile, jsonToString(parsedFiles));
		}

		const folders = findFoldersDB();

		let haveEpisodes = 0;
		for (const file of parsedFiles) {

			if (file.episodeNumbers?.[0] === undefined && file.episodeNumbers?.[0] === null) {
				continue;
			}

			const episode = getEpisodeDB({
				seasonNumber: file.seasons?.[0] ?? 1,
				episodeNumber: file.episodeNumbers[0],
				tv_id: data.id,
			});

			if (episode?.id) {
				const newFile: File = Object.keys(file)
					.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'artistFolder', 'musicFolder'].includes(key))
					.reduce((obj, key) => {
						obj[key] = file[key];
						return obj;
					}, <File>{});

				const seasonNumber = file.seasons?.[0] == null
					? 1
					: file.seasons?.[0];

				if (seasonNumber > 0) {
					haveEpisodes += 1;
				}

				try {
					insertFileDB({
						extension: newFile.extension,
						size: newFile.size,
						atimeMs: newFile.atimeMs,
						birthtimeMs: newFile.birthtimeMs,
						ctimeMs: newFile.ctimeMs,
						resolution: newFile.resolution,
						videoCodec: newFile.videoCodec,
						audioCodec: newFile.audioCodec,
						audioChannels: newFile.audioChannels,
						fullSeason: newFile.fullSeason,
						gid: newFile.gid,
						group: newFile.group,
						airDate: newFile.airDate as string,
						multi: newFile.multi,
						complete: newFile.complete,
						isMultiSeason: newFile.isMultiSeason,
						isPartialSeason: newFile.isPartialSeason,
						isSeasonExtra: newFile.isSeasonExtra,
						isSpecial: newFile.isSpecial,
						isTv: newFile.isTv,
						mode: newFile.mode,
						mtimeMs: newFile.mtimeMs,
						nlink: newFile.nlink,
						path: newFile.path,
						seasonPart: newFile.seasonPart,
						title: newFile.title,
						type: newFile.type,
						uid: newFile.uid,
						folder: file.folder,

						episodeFolder: file.episodeFolder as string,
						name: `/${file.name}` as string,
						year: file.year
							? parseInt(file.year.toString(), 10)
							: null,
						sources: JSON.stringify(file.sources),
						revision: JSON.stringify(file.revision),
						languages: JSON.stringify(file.languages),
						edition: JSON.stringify(file.edition),
						seasonNumber: seasonNumber,
						episodeNumber: file.episodeNumbers[0],
						ffprobe: file.ffprobe
							? JSON.stringify(file.ffprobe)
							: null,
						chapters: (file.ffprobe as VideoFFprobe)?.chapters
							? JSON.stringify((file.ffprobe as VideoFFprobe)?.chapters)
							: null,

						library_id: libraryId,
						episode_id: episode.id,
					});
				} catch (error) {
					Logger.log({
						level: 'error',
						name: 'App',
						color: 'red',
						message: JSON.stringify(['tv files', error]),
					});
				}

				try {
					if (file.ffprobe && file.folder) {
						// console.log({
						// 	folders,
						// 	folder: folder?.replace(/\\/gu, '/'),
						// 	path: folders.map(f => f.path?.replace(/\\/gu, '/')),
						// 	f: folders.find(f => folder?.replace(/\\/gu, '/').includes(f.path?.replace(/\\/gu, '/'))),
						// });
						insertVideoFileDB({
							filename: file.ffprobe?.format?.filename?.replace(/.+[\\\/](.+)/u, '/$1'),
							folder: file.folder + file.episodeFolder!,
							hostFolder: file.ffprobe?.format?.filename?.replace(/(.+)[\\\/].+/u, '$1'),
							duration: humanTime(file.ffprobe?.format?.duration),
							quality: JSON.stringify(getQualityTag(file.ffprobe)),
							share: folders.find(f => folder?.replace(/\\/gu, '/').includes(f.path?.replace(/\\/gu, '/')))?.id as string,
							subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe as VideoFFprobe)),
							languages: JSON.stringify((file.ffprobe as VideoFFprobe)?.streams?.audio?.map(a => a.language)),
							chapters: JSON.stringify((file.ffprobe as VideoFFprobe)?.chapters),
							episode_id: episode?.id,
						});
					}
				} catch (error) {
					Logger.log({
						level: 'error',
						name: 'App',
						color: 'red',
						message: JSON.stringify(['tv video file', error]),
					});
				}
			}
		}

		try {
			updateTv({
				id: data.id,
				haveEpisodes: haveEpisodes,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['tv video file update tv', error]),
			});
		}

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Found ${haveEpisodes} usable files for: ${data.title ?? data.name}`,
		});

		process?.send?.({
			type: 'custom',
			event: 'update_content',
			data: ['library'],
		});

	})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['tv file', error]),
			});
		});
};
