import { existsSync, readFileSync, writeFileSync } from 'fs';
// import lyricsFinder from 'lyrics-finder';
import { join } from 'path';

import type { AudioFFprobe } from '@server/encoder/ffprobe/ffprobe';
import { fileChangedAgo } from '@server/functions/dateTime';
import Logger from '@server/functions/logger';
import i18n from '@server/loaders/i18n';
// import { findLyrics } from '../../providers';
import { getAcousticFingerprintFromParsedFileList, Recording, Release } from '../../../providers/musicbrainz/fingerprint';
import { apiCachePath, cachePath } from '@server/state';
import { ParsedFileList } from '../../files/filenameParser';
import FileListing, { FileList } from '../../files/getFolders';
import { getEncoderLibraryById } from '@server/db/media/actions/libraries';
import { createArtist } from './createArtist';
import { createAlbum } from './createAlbum';
import fallback from './fallback';
import { recording } from '@server/providers/musicbrainz/recording';

export interface CurrentFolder {
	library_id: string;
	folder_id: string;
	folder: {
		id: string | null;
		created_at: string;
		updated_at: string;
		path: string | null;
	};
}

export const storeMusic = async ({
	folder,
	libraryId,
	task = { id: 'manual' },
}: {
	folder: string;
	libraryId: string;
	task?: { id: string; };
}) => {

	console.log({
		folder,
		libraryId,
		task,
	});
	if (!existsSync(folder)) {
		throw new Error(`Folder ${folder}does not exist`);
	}

	await i18n.changeLanguage('en');

	try {
		const fileList = await FileListing({
			folder: folder,
			recursive: true,
			filter: ['mp3', 'flac', 'm4a'],
			ignoreBaseFilter: true,
		});

		const parsedFiles = await getParsedFiles(fileList, folder);

		if (!parsedFiles) {
			return {
				success: false,
				message: `Something went wrong adding ${folder}`,
			};
		}

		const library = getEncoderLibraryById(libraryId)!;

		for (const [index, file] of parsedFiles.entries()) {
			// console.log({
			// 	index,
			// 	files: parsedFiles.length,
			// });

			const currentFolder = library.folder_library.find((lib) => {
				return file.path.startsWith(lib.folder.path!.replace(/\\/gu, '/') as string);
			})!;
			// console.log({ folder: currentFolder.folder.path });

			const match = await getMatch(file);
			// console.log({ title: match?.title });

			if (!match?.title) {
				await fallback(file, library, currentFolder);
				continue;
			}

			for (const artist of match.artists ?? []) {
				await createArtist(library, artist, currentFolder);
			}

			await createAlbum(
				library,
				file,
				match.releases[0],
				match.id,
				match.title,
				match.artists,
				currentFolder
			);
		}

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Folder: ${folder} added successfully`,
		});

		return {
			success: true,
			message: `Folder: ${folder} added successfully`,
			data: {
				folder,
				id: 10,
			},
		};
	} catch (error: any) {
		console.log(error);
		// if (error) {
		// 	Logger.log({
		// 		level: 'error',
		// 		name: 'App',
		// 		color: 'red',
		// 		message: JSON.stringify([`${__filename}`, error]),
		// 	});
		// }

		return {
			success: false,
			message: `Something went wrong adding ${folder}`,
			error: error,
		};
	}
};

const getParsedFiles = async (fileList: FileList, folder: string) => {
	const folderFile = join(cachePath, 'temp', `${folder.replace(/[\\\/:]/gu, '_')}_parsed.json`);

	let parsedFiles: ParsedFileList[] = new Array<ParsedFileList>();
	try {
		if (
			existsSync(folderFile)
			&& fileChangedAgo(folderFile, 'days') < 50
			&& JSON.parse(readFileSync(folderFile, 'utf-8')).length > 0
		) {
			parsedFiles = JSON.parse(readFileSync(folderFile, 'utf-8'))
				.sort((a: ParsedFileList, b: ParsedFileList) =>
					a.path.localeCompare(b.path));
		}
		parsedFiles = (await fileList.getParsedFiles()).sort((a, b) => a.path.localeCompare(b.path));

		writeFileSync(folderFile, JSON.stringify(parsedFiles));
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'red',
			message: JSON.stringify([`${__filename}`, error]),
		});
	}

	return parsedFiles;
};

const getMatch = async (file: ParsedFileList) => {

	const trackInfoFile = join(apiCachePath, `fileInfo_${file.name.replace(/\.\w{3,}$/u, '.json')}`);

	let match: Recording | undefined;

	if (existsSync(trackInfoFile)) {
		match = JSON.parse(readFileSync(trackInfoFile, 'utf8'));
	} else {
		const data = await getAcousticFingerprintFromParsedFileList(file);

		if (!data?.recordings) {
			return;
		}
		
		try {
			const req = recording(data?.recordings[0].id);
			match = data?.recordings[0];
		} catch (error) {
			try {
				const req = recording(data?.recordings[1].id);
				match = data?.recordings[1];
			} catch (error) {
				console.log(error);
			}
		}

		// const newMatch = filterRecordings(data?.recordings, file);
		//
		// if (newMatch) {
		// 	match = newMatch;
		// } else {
		// 	match = data?.recordings[0];
		// }

		if (match?.id) {
			writeFileSync(trackInfoFile, JSON.stringify(match, null, 2));
		}
	}

	return match;
};

const findRelease = (data: Release[], file: ParsedFileList) => {
	const matches = /.+[\\\/]((?<album>\d{1,2})-)?(?<track>\d{1,2})(\.)?\s(?<title>.+)\.(?<ext>\w{3,4})$/u.exec(file.path)?.groups;
	const albumName = file.musicFolder?.replace(/[\\\/]\[\d{4}\]\s|\[\w+\]/u, '');

	let releases = data?.filter(r => r.title == albumName);
	if (!releases) {
		releases = data;
	}

	if (releases.length > 1) {
		releases = releases?.filter(r => r.mediums?.[0]?.position == Number(matches?.album));
	}

	if (releases.length > 1) {
		releases = releases?.filter(r => r.mediums?.[0]?.tracks?.[0]?.position == Number(matches?.track));
	}

	if (releases.length == 1) {
		return releases[0];
	}

	if (releases.length == 0) {
		releases = data.filter(
			r =>
				r.id == (file.ffprobe as AudioFFprobe).tags?.MusicBrainz_album_id || r.title == (file.ffprobe as AudioFFprobe).tags?.album
		);
		if (releases.length == 1) {
			return releases[0];
		}
	}
};

const filterRecordings = (data: Recording[], file: ParsedFileList) => {
	let recording: Recording | undefined;

	for (const _recording of data) {
		if (!_recording?.releases) continue;

		const release = findRelease(_recording.releases, file);

		if (release) {
			_recording.releases = [release];
			recording = _recording;
			break;
		}
	}
	return recording;
};
