/* eslint-disable @typescript-eslint/no-unused-vars */
import { DirectoryTree } from 'directory-tree';

import { AudioFFprobe, VideoFFprobe } from '../../encoder/ffprobe/ffprobe';
import getAudioInfo from '../../encoder/ffprobe/getAudioInfo';
import getVideoInfo from '../../encoder/ffprobe/getVideoInfo';
/* eslint-disable max-len */
import { parseYear } from '@server/functions/dateTime';
import { pad } from '@server/functions/stringArray';
import { filenameParse, ParsedMovie, ParsedShow } from '@server/functions/videoFilenameParser';
import { Channels } from '@server/functions/videoFilenameParser/audioChannels';
import { MovieAppend } from '@server/providers/tmdb/movie';
import { TvAppend } from '@server/providers/tmdb/tv';
import { AppState, useSelector } from '@server/state/redux';
import { Episode } from '@server/db/media/actions/episodes';
import { Movie } from '@server/db/media/actions/movies';
import { EncodingLibrary } from '@server/db/media/actions/libraries';
import { Tv } from '@server/db/media/actions/tvs';
import { Season } from '@server/db/media/actions/seasons';

interface IObj {
	[key: string]: any;
}

export interface ParsedFileList extends ParsedMovie, ParsedShow {
	path: string;
	folder: string;
	episodeFolder?: string;
	musicFolder?: string;
	name: string;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	type: string;
	extension: string;
	size: number;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	birthtimeMs: number;
	ffprobe?: VideoFFprobe | AudioFFprobe;
}

export interface FileNameInfo {
	season_num: number;
	ep_num: number;
	mediumType: string;
}

export interface FolderList {
	path: string;
	name: string;
	title: string;
	year: number;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	type: string;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	birthtimeMs: number;
}

export const yearRegex = /(\s|\.|\()(?<year>(19|20)[0-9][0-9])(\)|.*|(?!p))/u;

export const parseFileName = async function (file: DirectoryTree<IObj> | { path: string; }, isTvShow: boolean): Promise<ParsedFileList> {
	const reg: any = /(.*[\\\/])(?<fileName>.*)/u.exec(file.path);

	const yearReg: any = yearRegex.exec(file.path);

	const fileName: any = reg.groups.fileName;

	const res: ParsedFileList = <ParsedFileList>{ ...filenameParse(fileName, isTvShow) };

	for (const obj of Object.entries(file)) {
		if (obj[0] == 'children') continue;
		if (obj[0] == 'path') {
			res.ffprobe = await getVideoInfo(obj[1] as string).catch(_error => undefined);
		}
		res[obj[0]] = obj[1];
	}

	res.year = parseInt(yearReg?.groups?.year, 10);

	if (!res.ffprobe) {
		res.ffprobe = await getAudioInfo(file.path).catch(_error => undefined);
		if (res.ffprobe) {
			res.year = parseInt((res.ffprobe as AudioFFprobe).tags?.originalyear ?? '0', 10);
			res.audioChannels = res.ffprobe.audio.channels == 2
				? Channels.STEREO
				: Channels.SIX;
			res.title = res.ffprobe.tags.title ?? res.name.replace(/\d+\s(.+)\.\w{3}/u, '$1');
		}
	}

	res.episodeFolder = file.path.replace(/.+[\\\/].+(\s|\.|\()(?<year>(19|20)[0-9][0-9])(\)|.*|(?!p))([\\\/].+)[\\\/].+/u, '$5');
	res.folder = file.path.replace(/.+([\\\/].+(\s|\.|\()(?<year>(19|20)[0-9][0-9])(\)|.*|(?!p)))[\\\/].+/u, '$1');

	if (['mp3', 'flac', 'alac'].includes((res.ffprobe as AudioFFprobe)?.audio?.codec_name)) {
		res.musicFolder = file.path.replace(/.+[\\\/](\[.+)[\\\/].+[\\\/]?/u, '/$1');
		res.folder = file.path.replace(/.+[\\\/](.+[\\\/].+)[\\\/].+[\\\/].+/u, '/$1');
		res.episodeFolder = undefined;
	}

	if (res.episodeFolder?.includes(res.name)) {
		res.episodeFolder = '';
	}
	// console.log(file.path);
	// console.log(res);
	// console.log(res.audioCodec);

	return res;
};

export const parseTitle = (title: string) => {
	let m: any;
	const regex = /([\w’'_\(-]+)|([^\w{2}](?<abb>(\w{1}\.){2,}\(?))/gu;
	const arr: string[] = [];

	while ((m = regex.exec(title)) !== null) {
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		m.forEach((match: string, groupIndex: number) => {
			if (groupIndex == 0) {
				arr.push(match);
			}
		});
	}
	return arr
		.join('+')
		.replace(/\+(\w)$/gu, '$1')
		.replace(/^(\w)\+\./gu, '$1.');
};

export const parseFolderName = function (file: DirectoryTree<IObj>) {
	const res: FolderList = <FolderList>{};

	Object.entries(file)?.map((c) => {

		if (c[0] == 'children') return;
		if (c[0] == 'name') {
			const name = (c[1] as string).split('.(');
			const yearReg: any = yearRegex.exec(c[1] as string);
			if (name[0] && name[1]) {
				res.title = name[0];
				res.year = yearReg?.groups?.year;
			}
		}
		res[c[0]] = c[1];
	});

	return res;
};

export const createRootFolderName = function (folder: string) {
	const libraries = useSelector((state: AppState) => state.config.libraries);

	const rootFolder = libraries
		.find(l => l?.folder_library.find(m => folder.includes(m.folder?.path as string)))
		?.folder_library?.find(m => folder.includes(m.folder?.path as string))?.folder?.path;

	return rootFolder;
};

export const cleanFileName = function (name: string) {
	return name
		.replace(/\//gu, '.')
		.replace(/:\s/gu, '.')
		.replace(/\s/gu, '.')
		.replace(/\? {2}/gu, '.')
		.replace(/\? /gu, '.')
		.replace(/,\./gu, '.')
		.replace(/, /gu, '.')
		.replace(/`/gu, '')
		.replace(/'/gu, '')
		.replace(/"/gu, '')
		.replace(/,/gu, '.')
		.replace(/"/gu, '\'')
		.replace(/\.{2,}/u, '.')
		.replace(/\s/gu, '.')
		.replace(/&/gu, 'and')
		.replace(/#/gu, '%23')
		.replace(/!/gu, '')
		.replace(/\*/gu, '-')
		.replace(/\.\./gu, '.')
		.replace(/,\./gu, '.')
		.replace(/: /gu, '.')
		.replace(/:/gu, '.')
		.replace(/\.*$/gu, '')
		.replace(/'|\?|\.\s|-\.|\.\(\d{1,3}\)|[^[:print:]\]|[^-_.[:alnum:]\]/giu, '')
		.replace(/\.{2,}/gu, '.');
};

export const createTitleSort = function (title: string, date?: string | number) {

	title = title[0].toUpperCase() + title.slice(1);

	const newTitle = cleanFileName(
		title
			.replace(/^The[\s]*/u, '')
			.replace(/^An[\s]{1,}/u, '')
			.replace(/^A[\s]{1,}/u, '')
			.replace(/:\s|\sand\sthe/u, date
				? `.${parseYear(date)}`
				: '.')
			.replace(/\./gu, ' ')
	);
	return newTitle.toLowerCase();
};

export const createMediaFolder = (
	library: EncodingLibrary,
	data: MovieAppend | TvAppend
): string => {
	const baseFolder = library.folder_library[0].folder?.path;

	const title = cleanFileName((data as MovieAppend).title ?? (data as TvAppend).name);

	const year = parseYear((data as MovieAppend).release_date ?? (data as TvAppend).first_air_date);

	return `${baseFolder}/${title}.(${year})`;
};

export type EP = (Episode & {
	tv: Tv;
	season: Season;
	files: (File & {
		library: EncodingLibrary;
	})[];
});

export type MV = (Movie & {
	files: (File & {
		library: EncodingLibrary;
	})[];
});

export const createBaseFolder = (data: Episode & { tv: Tv } | Movie): string => {
	const name = `${((data as Episode & { tv: Tv }).tv ?? data).title}.(${parseYear((data as { tv: Tv }).tv?.firstAirDate ?? (data as Movie)?.releaseDate)})`;

	return cleanFileName(name);
};

export const createEpisodeFolder = function (data: Episode & { tv: Tv }) {
	const name = `${data.tv.title}.S${pad(data.seasonNumber, 2)}E${pad(data.episodeNumber, 2)}`;

	return cleanFileName(name);
};

export const createFileName = function (data: Episode & { tv: Tv } | Movie) {
	let name = '';

	if ((data as Movie).releaseDate) {
		name = `${(data as Movie).title}.(${parseYear((data as Movie).releaseDate)}).NoMercy`;
	} else {
		name = `${(data as Episode & { tv: Tv }).tv.title}.S${pad((data as Episode & { tv: Tv }).seasonNumber, 2)}E${pad((data as Episode & { tv: Tv }).episodeNumber, 2)}.${(data as Episode & { tv: Tv }).title}.NoMercy`;
	}

	return cleanFileName(name);
};
