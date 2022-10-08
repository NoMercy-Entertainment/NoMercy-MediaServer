/* eslint-disable max-len */
// import { anime_regexes, dvd_regexes, movie_regexes, normal_regexes } from './nameRegexes';
import { parseYear } from '../../functions/dateTime';
import { pad } from '../../functions/stringArray';
import { AppState, useSelector } from '../../state/redux';
import { DirectoryTree } from 'directory-tree';
import getVideoInfo from '../../encoder/ffprobe/getVideoInfo';
import { VideoFFprobe } from '../../encoder/ffprobe/ffprobe';
import { filenameParse, ParsedMovie, ParsedShow } from '../../functions/videoFilenameParser';

interface IObj {
	[key: string]: any;
}

export interface ParsedFileList extends ParsedMovie, ParsedShow {
	path: string;
	folder: string;
	ep_folder: string;
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
	ffprobe?: VideoFFprobe;
}

export interface ShowData {
	title: string;
	name: string;
	description: string;
	first_air_date: string;
	release_date: string;
	mediumType: string;
	seasons: Season[];
}

export interface Season {
	season_number: number;
	episodes: Episode[];
}

export interface Episode {
	id: number;
	title: string;
	episode_number: number;
	season_number: number;
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

export const yearRegex = new RegExp('(\\s|\\.|\\()(?<year>(19|20)[0-9][0-9])(\\)|.*|(?!p))', 'u');

export const parseFileName = async function (file: DirectoryTree<IObj>, isTvShow: boolean): Promise<ParsedFileList> {
	
	let reg: any = /(.*[\\\/])(?<fileName>.*)/u.exec(file.path);

	const yearReg: any = yearRegex.exec(file.path);

	const fileName: any = reg.groups.fileName;

	let res: ParsedFileList = <ParsedFileList>{...filenameParse(fileName, isTvShow)};

	for (const obj of Object.entries(file)) {
		if (obj[0] == 'children') continue;
		if (obj[0] == 'path') {
			res.ffprobe = await getVideoInfo(obj[1] as string)
				.catch(error => undefined);
		};
		res[obj[0]] = obj[1];
	}

	res.year = yearReg?.groups?.year;
	
	if(res.episodeNumbers?.length > 0){
		res.folder = file.path.replace(/.+[\\\/](.+)[\\\/].+[\\\/].+/u, '/$1');
	}
	else {
		res.folder = file.path.replace(/.+[\\\/](.+)[\\\/].+/u, '/$1');
	}

	res.ep_folder = file.path.replace(/.+[\\\/](.+\(.+)[\\\/].+[\\\/]?/u, '/$1');

	return res;
};

const parseTitle = (title: string) => {
	let m: any;
	const regex = /([\w’'_\(-]+)|([^\w{2}](?<abb>(\w{1}\.){2,}\(?))/g;
	const arr: string[] = [];

	while ((m = regex.exec(title)) !== null) {
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		
		m.forEach((match: string, groupIndex: number) => {
			if(groupIndex == 0){
				arr.push(match);
			}
		});
	}
	return arr.join('+').replace(/\+(\w)$/g, '$1').replace(/^(\w)\+\./g, '$1.');
}

export const parseFolderName = function (file: DirectoryTree<IObj>) {

	const res: FolderList = <FolderList>{};

	Object.entries(file)?.map((c) => {

		if (c[0] == 'children') return;
		if (c[0] == 'name') {
			const name = (c[1] as string).split('.(');
			const yearReg: any = yearRegex.exec(c[1] as string);
			if(name[0] && name[1]) {
				// console.log(parseTitle(name[0]));
				res['title'] = name[0];
				res['year'] = yearReg?.groups?.year;
			}
		};
		res[c[0]] = c[1];
	});

	return res;
};

export const createRootFolderName = function (folder: string) {
	const libraries = useSelector((state: AppState) => state.config.libraries);
	const rootFolder = libraries
		.find((l) => l.folders.find((m) => folder.includes(m.path)))
		?.folders?.find((m) => folder.includes(m.path))?.path;

	return rootFolder;
};

export const createBaseFolderName = function (showData: ShowData) {
	const baseName = `${showData.title || showData.name}.(${parseYear(showData.first_air_date || showData.release_date)})/`;

	return cleanFileName(baseName);
};

export const getEpisodeIndex = function (showData: ShowData, filenameInfo: FileNameInfo) {
	const data = episodeData(showData, filenameInfo);

	return data ? data.id : null;
};

export const createShowFolderName = function (type: string, showData: ShowData, filenameInfo: FileNameInfo) {
	let showName: string;

	if (type == 'movie') {
		showName = `${showData.title || showData.name}.(${parseYear(showData.release_date)})`;
	} else {
		showName = `${showData.title || showData.name}.S${pad(filenameInfo.season_num, 2)}E${pad(filenameInfo.ep_num, 2)}`;
	}
	return cleanFileName(showName);
};

export const createFileName = function (type: string, showData: ShowData, episode: Episode) {
	let showName: string;
	let fileName: string;

	const title = episode?.title.substring(0, 100) || showData.name?.substring(0, 100) || showData.title?.substring(0, 100);

	if (type == 'movie') {
		fileName = `${showData.title || showData.name}.(${parseYear(showData.release_date)})`;
	} else {
		showName = `${showData.title || showData.name}.S${pad(episode.season_number, 2)}E${pad(episode.episode_number, 2)}`;
		fileName = showName + (episode ? `.${title}` : '').replace(/\//gu, '.');
	}

	return cleanFileName(fileName);
};

export const episodeData = function (showData: ShowData, filenameInfo: FileNameInfo) {
	const season = showData.seasons.find((s) => s.season_number == filenameInfo.season_num);
	const episodeData = season?.episodes.find((ep) => ep.episode_number == filenameInfo.ep_num);

	return episodeData;
};

export const cleanFileName = function (name: string) {
	return name
		.replace(/:\s/gu, '.')
		.replace(/\? {2}/gu, '.')
		.replace(/\? /gu, '.')
		.replace(/,\./gu, '.')
		.replace(/, /gu, '.')
		.replace(/`/gu, '')
		.replace(/'/gu, '')
		.replace(/"/gu, '')
		.replace(/,/gu, '.')
		.replace(/"/gu, "'")
		.replace(/\.{2,}/u, '.')
		.replace(/\s/gu, '.')
		.replace(/&/gu, 'and')
		.replace(/#/gu, '%23')
		.replace(/!/gu, '')
		.replace(/\*/gu, '-')
		.replace(/\.\./gu, '.')
		.replace(/,\./gu, '.')
		.replace(/:/gu, '.')
		.replace(/'|\?|\.\s|-\.|\.\(\d{1,3}\)|[^[:print:]\]|[^-_.[:alnum:]\]/giu, '')
		.replace(/\.{2,}/gu, '.');
};

export const createTitleSort = function (title: string, date?: string) {
	const newTitle = cleanFileName(
		title
			.replace(/^The[\s]*/u, '')
			.replace(/^An[\s]{1,}/u, '')
			.replace(/^A[\s]{1,}/u, '')
			.replace(/:\s|\sand\sthe/u, date ? `.${parseYear(date)}` : '.')
			.replace(/\./gu, ' ')
	);
	return newTitle.toLowerCase();
};
