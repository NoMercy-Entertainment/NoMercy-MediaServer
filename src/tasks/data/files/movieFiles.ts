import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { fileChangedAgo } from '@server/functions/dateTime';
import Logger from '@server/functions/logger';
import { jsonToString } from '@server/functions/stringArray';
import { cachePath } from '@server/state';
import { ParsedFileList } from '../../../tasks/files/filenameParser';
import FileList from '../../../tasks/files/getFolders';

import type { VideoFFprobe } from '../../../encoder/ffprobe/ffprobe';
import { File, insertFileDB } from '@server/db/media/actions/files';
import { findFoldersDB } from '@server/db/media/actions/folders';

export default async ({ data, folder, libraryId }) => {
	return await FileList({
		folder: folder,
		recursive: true,
	}).then(async (fileList) => {

		const folderFile = join(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);

		let parsedFiles: ParsedFileList[];
		if (existsSync(folderFile) && fileChangedAgo(folderFile, 'days') < 1 && JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0) {
			parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'));
		} else {
			parsedFiles = await fileList.getParsedFiles();
			writeFileSync(folderFile, jsonToString(parsedFiles));
		}

		const folders = findFoldersDB();

		let foundFiles = 0;

		for (const file of parsedFiles) {

			const newFile: File = Object.keys(file)
				.filter(key => !['seasons', 'episodeNumbers', 'ep_folder', 'artistFolder', 'musicFolder'].includes(key))
				.reduce((obj, key) => {
					obj[key] = file[key];
					return obj;
				}, <File>{});

			try {
				insertFileDB({
					episodeFolder: newFile.episodeFolder,
					name: newFile.name,
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
					library_id: libraryId,
					movie_id: data.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['movie file', error]),
				});
			}

			try {
				// if (file.ffprobe?.format && file.folder) {
				// 	insertVideoFileDB({
				// 		filename: file.ffprobe!.format.filename.replace(/.+[\\\/](.+)/u, '/$1'),
				// 		folder: file.folder,
				// 		hostFolder: file.ffprobe!.format.filename.replace(/(.+)[\\\/].+/u, '$1'),
				// 		duration: humanTime(file.ffprobe!.format.duration),
				// 		quality: JSON.stringify(getQualityTag(file.ffprobe)),
				// 		share: folders.find(f => folder.includes(f.path?.replace(/\\/gu, '/')))?.id ?? undefined,
				// 		subtitles: JSON.stringify(getExistingSubtitles(file.ffprobe as VideoFFprobe)),
				// 		languages: JSON.stringify((file.ffprobe as VideoFFprobe).streams.audio.map(a => a.language)),
				// 		chapters: JSON.stringify((file.ffprobe as VideoFFprobe).chapters),
				// 		movie_id: data.id,
				// 	});
	
				// 	foundFiles += 1;
				// }

			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['movie video file', error]),
				});
			}
		}

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Found ${foundFiles} usable files for: ${data.title ?? data.name}`,
		});
	}).catch((error) => {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'red',
			message: JSON.stringify(['movie file', error]),
		});
	});
};
