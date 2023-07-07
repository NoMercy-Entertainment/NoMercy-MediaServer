import { deviceName } from '@/functions/system';
import { ConfigData } from '@/types/server';

export const configData: ConfigData = {
	secureInternalPort: process.env.DEFAULT_PORT ?? 7635,
	secureExternalPort: process.env.DEFAULT_PORT ?? 7635,
	deviceName: deviceName,
	queueWorkers: 2,
	cronWorkers: 0,
	dataWorkers: 2,
	requestWorkers: 5,
	encoderWorkers: 1,
	maxAttempts: 2,
};

export const notificationData: { [arg: string]: boolean; } = {
	updateAvailable: true,
	updateInstalled: true,
	installFailed: true,
	scheduledFailed: true,
	systemRebooted: true,
	newContent: false,
	pluginFailed: true,
	pluginInstalled: true,
	pluginRemoved: true,
	pluginUpdated: true,
};

export const encoderProfiles = [
	{
		id: 'cl7i4o7v6001jqwef0nn3avkm',
		name: '2160p high',
		container: 'auto',
		params: {
			width: 3840,
			height: undefined,
			crf: 20,
			bitrate: undefined,
			maxrate: undefined,
			preset: 'slow',
			profile: 'high',
			codec: 'H264',
			audio: 'aac',
		},
	},
	{
		id: 'cl7i4o7v7001kqwef32im51hk',
		name: '1080p high',
		container: 'auto',
		params: {
			width: 1920,
			height: undefined,
			crf: 20,
			bitrate: undefined,
			maxrate: undefined,
			preset: 'slow',
			profile: 'high',
			codec: 'H264',
			audio: 'aac',
		},
	},
	{
		id: 'cl7i4o7v7001lqwefcnljgy5o',
		name: '1080p regular',
		container: 'auto',
		params: {
			width: 1920,
			height: undefined,
			crf: 28,
			bitrate: undefined,
			maxrate: undefined,
			preset: 'slow',
			codec: 'H264',
			audio: 'aac',
		},
	},
];

// interface Folder {
// 	id: string;
// 	path: string;
// }
// export const folders: Folder[] = [
// 	{
// 		id: 'cl7i4km1n0000qwefaltp4913',
// 		path: 'M:\\Anime\\Anime',
// 	},
// 	{
// 		id: 'cl7i4km1o0001qwefarqd8r0q',
// 		path: 'M:\\Films\\Films',
// 	},
// 	{
// 		id: 'cl7i4km1o0002qwef0xv15b15',
// 		path: 'M:\\TV.Shows\\TV.Shows',
// 	},
// 	{
// 		id: 'cl7i4km1o0003qwef44qpen9z',
// 		path: 'M:\\Music',
// 	},
// 	// {
// 	// 	id: 'cl7i4km1n0000qwefaltp4913',
// 	// 	path: 'Z:\\mnt\\m\\Anime\\Anime',
// 	// },
// 	// {
// 	// 	id: 'cl7i4km1o0001qwefarqd8r0q',
// 	// 	path: 'Z:\\mnt\\m\\Films\\Films',
// 	// },
// 	// {
// 	// 	id: 'cl7i4km1o0002qwef0xv15b15',
// 	// 	path: 'Z:\\mnt\\m\\TV.Shows\\TV.Shows',
// 	// },
// 	// {
// 	// 	id: 'cl7i4km1o0003qwef44qpen9z',
// 	// 	path: 'Z:\\mnt\\m\\Music',
// 	// },
// ];

interface LibrarySeed {
	id: string;
	image: string | null;
	title: string;
	type: string;
	language: string;
	country: string;
	specialSeasonName: string;
	realtime: boolean;
	autoRefreshInterval: number;
	chapterImages: boolean;
	extractChaptersDuring: boolean;
	extractChapters: boolean;
	perfectSubtitleMatch: boolean;
	folders: {
		id: string;
	}[];
};
export const libraries: LibrarySeed[] = [
	{
		id: 'cl7i4km1o0004qwef9472dy2t',
		image: '/wgMxlmsqonV8vymd0JimlUvg82D.jpg',
		title: 'Anime',
		type: 'tv',
		language: 'nl',
		country: 'NL',
		specialSeasonName: 'Specials',
		realtime: true,
		autoRefreshInterval: 30,
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1n0000qwefaltp4913',
			},
			{
				id: 'clivil67p0000z4ef11fi331z',
			},
		],
	},
	{
		id: 'clisdhulg009yefcsq0oudnvk',
		image: '/nWwwRVsnVpmlZMob6y19R96YldR.jpg',
		title: 'Films',
		type: 'movie',
		language: 'nl',
		country: 'NL',
		specialSeasonName: 'Specials',
		realtime: true,
		autoRefreshInterval: 30,
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1o0001qwefarqd8r0q',
			},
			{
				id: 'cliolwzww00026gef7kkfc0xz',
			},
		],
	},
	{
		id: 'cliryptr10002efmk294kpkhn',
		image: '/rfGg1ZLNvlfTfiY5941IFjEKMK1.jpg',
		title: 'Series',
		type: 'tv',
		language: 'nl',
		country: 'NL',
		specialSeasonName: 'Specials',
		realtime: true,
		autoRefreshInterval: 30,
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1o0002qwef0xv15b15',
			},
			{
				id: 'cliols0ug00006gefdz0xboq2',
			},
		],
	},
	{
		id: 'cl7i4km1o000iqwefbtxz1hyp',
		title: 'Music',
		type: 'music',
		image: null,
		language: 'nl',
		country: 'NL',
		specialSeasonName: '',
		realtime: true,
		autoRefreshInterval: 30,
		chapterImages: false,
		extractChaptersDuring: false,
		extractChapters: false,
		perfectSubtitleMatch: false,
		folders: [
			{
				id: 'cl7i4km1o0003qwef44qpen9z',
			},
			{
				id: 'clixem1xh0000bcef10jx80vt',
			},
		],
	},
	// {
	// 	id: 'cl7i4km1o000aqweffmongx0u',
	// 	image: null,
	// 	title: 'Collections',
	// 	type: 'collection',
	// 	language: 'nl',
	// 	country: 'NL',
	// 	specialSeasonName: 'Specials',
	// 	realtime: true,
	// 	autoRefreshInterval: 30,
	// 	chapterImages: true,
	// 	extractChaptersDuring: true,
	// 	extractChapters: true,
	// 	perfectSubtitleMatch: true,
	// 	folders: [],
	// },
	// {
	// 	id: 'cl7i4km1o000eqwefeej91x9g',
	// 	image: null,
	// 	title: 'Specials',
	// 	type: 'special',
	// 	language: 'nl',
	// 	country: 'NL',
	// 	specialSeasonName: 'Specials',
	// 	realtime: true,
	// 	autoRefreshInterval: 30,
	// 	chapterImages: true,
	// 	extractChaptersDuring: true,
	// 	extractChapters: true,
	// 	perfectSubtitleMatch: true,
	// 	folders: [],
	// },
];

interface SpecialData {
	movieId?: number;
	episodeId?: number;
};
export const specialData: SpecialData[] = [
	{ movieId: 1771 },
	{ episodeId: 1013214 },
	{ episodeId: 1026747 },
	{ episodeId: 1026748 },
	{ episodeId: 1034250 },
	{ episodeId: 1037986 },
	{ episodeId: 1037987 },
	{ episodeId: 1037988 },
	{ episodeId: 1037989 },
	{ episodeId: 1137077 },
	{ episodeId: 1143050 },
	{ episodeId: 1148390 },
	{ episodeId: 1159990 },
	{ episodeId: 1160670 },
	{ episodeId: 1165223 },
	{ episodeId: 1165224 },
	{ episodeId: 1165523 },
	{ episodeId: 1165524 },
	{ episodeId: 1165525 },
	{ movieId: 211387 },
	{ movieId: 299537 },
	{ movieId: 1726 },
	{ movieId: 10138 },
	{ movieId: 1724 },
	{ movieId: 10195 },
	{ movieId: 76122 },
	{ movieId: 76535 },
	{ movieId: 448366 },
	{ movieId: 76338 },
	{ movieId: 68721 },
	{ movieId: 100402 },
	{ episodeId: 972992 },
	{ episodeId: 63412 },
	{ episodeId: 63413 },
	{ episodeId: 63414 },
	{ episodeId: 63415 },
	{ episodeId: 63416 },
	{ episodeId: 63417 },
	{ episodeId: 63418 },
	{ episodeId: 63419 },
	{ episodeId: 63420 },
	{ episodeId: 63421 },
	{ episodeId: 63422 },
	{ episodeId: 63423 },
	{ episodeId: 971804 },
	{ episodeId: 971979 },
	{ episodeId: 973093 },
	{ episodeId: 973397 },
	{ episodeId: 974019 },
	{ episodeId: 974709 },
	{ episodeId: 974655 },
	{ episodeId: 975266 },
	{ episodeId: 975473 },
	{ movieId: 118340 },
	{ movieId: 283995 },
	{ episodeId: 1036348 },
	{ episodeId: 1036350 },
	{ episodeId: 1036351 },
	{ episodeId: 1036352 },
	{ episodeId: 1036353 },
	{ episodeId: 1036354 },
	{ episodeId: 1036355 },
	{ episodeId: 1036356 },
	{ episodeId: 1036357 },
	{ episodeId: 1036358 },
	{ episodeId: 1036359 },
	{ episodeId: 1036360 },
	{ episodeId: 1036361 },
	{ movieId: 99861 },
	{ episodeId: 1000647 },
	{ episodeId: 1007159 },
	{ episodeId: 1009280 },
	{ episodeId: 1010174 },
	{ episodeId: 1010683 },
	{ episodeId: 1010684 },
	{ episodeId: 1013262 },
	{ episodeId: 1016544 },
	{ episodeId: 1018666 },
	{ episodeId: 1019800 },
	{ episodeId: 1019801 },
	{ episodeId: 1043555 },
	{ episodeId: 1043556 },
	{ episodeId: 1046566 },
	{ episodeId: 1046817 },
	{ episodeId: 1048738 },
	{ episodeId: 1049931 },
	{ episodeId: 1051253 },
	{ episodeId: 1051254 },
	{ episodeId: 1051255 },
	{ episodeId: 1051256 },
	{ episodeId: 1051257 },
	{ movieId: 102899 },
	{ episodeId: 1105754 },
	{ episodeId: 1105755 },
	{ episodeId: 1105756 },
	{ episodeId: 1105757 },
	{ episodeId: 1105758 },
	{ episodeId: 1105759 },
	{ episodeId: 1105760 },
	{ episodeId: 1105761 },
	{ episodeId: 1105762 },
	{ episodeId: 1105763 },
	{ episodeId: 1105764 },
	{ episodeId: 1105765 },
	{ episodeId: 1105766 },
	{ episodeId: 1167028 },
	{ episodeId: 1175503 },
	{ episodeId: 1175504 },
	{ episodeId: 1175505 },
	{ episodeId: 1175506 },
	{ episodeId: 1175507 },
	{ episodeId: 1175508 },
	{ episodeId: 1175509 },
	{ episodeId: 1175510 },
	{ episodeId: 1175511 },
	{ episodeId: 1175512 },
	{ episodeId: 1175513 },
	{ episodeId: 1175514 },
	{ movieId: 271110 },
	{ episodeId: 1085277 },
	{ episodeId: 1085278 },
	{ episodeId: 1109828 },
	{ episodeId: 1112975 },
	{ episodeId: 1117287 },
	{ episodeId: 1133154 },
	{ episodeId: 1134492 },
	{ episodeId: 1134703 },
	{ episodeId: 1137415 },
	{ episodeId: 1142067 },
	{ episodeId: 1173978 },
	{ episodeId: 1175551 },
	{ episodeId: 1176885 },
	{ episodeId: 1180188 },
	{ episodeId: 1180189 },
	{ episodeId: 1182846 },
	{ episodeId: 1184330 },
	{ episodeId: 1187281 },
	{ episodeId: 1189229 },
	{ episodeId: 1191831 },
	{ episodeId: 1191832 },
	{ episodeId: 1191833 },
	{ episodeId: 1045315 },
	{ episodeId: 1221122 },
	{ episodeId: 1221123 },
	{ episodeId: 1221124 },
	{ episodeId: 1221125 },
	{ episodeId: 1221126 },
	{ episodeId: 1221127 },
	{ episodeId: 1221128 },
	{ episodeId: 1221129 },
	{ episodeId: 1221130 },
	{ episodeId: 1221131 },
	{ episodeId: 1221132 },
	{ episodeId: 1221133 },
	{ movieId: 497698 },
	{ movieId: 315635 },
	{ movieId: 284054 },
	{ movieId: 284052 },
	{ episodeId: 1045314 },
	{ episodeId: 1271969 },
	{ episodeId: 1271970 },
	{ episodeId: 1271971 },
	{ episodeId: 1271972 },
	{ episodeId: 1271973 },
	{ episodeId: 1271974 },
	{ episodeId: 1271975 },
	{ episodeId: 1271976 },
	{ episodeId: 1271977 },
	{ episodeId: 1271978 },
	{ episodeId: 1271979 },
	{ episodeId: 1271980 },
	{ episodeId: 1206223 },
	{ episodeId: 1223126 },
	{ episodeId: 1226945 },
	{ episodeId: 1228589 },
	{ episodeId: 1229423 },
	{ episodeId: 1232364 },
	{ episodeId: 1236671 },
	{ episodeId: 1236672 },
	{ episodeId: 1236673 },
	{ episodeId: 1251661 },
	{ episodeId: 1252726 },
	{ episodeId: 1252728 },
	{ episodeId: 1252729 },
	{ episodeId: 1252731 },
	{ episodeId: 1265156 },
	{ episodeId: 1275764 },
	{ episodeId: 1298641 },
	{ episodeId: 1298642 },
	{ episodeId: 1302044 },
	{ episodeId: 1304542 },
	{ episodeId: 1310650 },
	{ episodeId: 1310651 },
	{ episodeId: 1243265 },
	{ episodeId: 1278477 },
	{ episodeId: 1336814 },
	{ episodeId: 1336815 },
	{ episodeId: 1336816 },
	{ episodeId: 1336817 },
	{ episodeId: 1336818 },
	{ episodeId: 1336819 },
	{ episodeId: 1279700 },
	{ episodeId: 1332116 },
	{ episodeId: 1367789 },
	{ episodeId: 1367945 },
	{ episodeId: 1367946 },
	{ episodeId: 1367947 },
	{ episodeId: 1367948 },
	{ episodeId: 1367949 },
	{ movieId: 284053 },
	{ episodeId: 1209036 },
	{ episodeId: 1209319 },
	{ episodeId: 1209320 },
	{ episodeId: 1209321 },
	{ episodeId: 1209322 },
	{ episodeId: 1209323 },
	{ episodeId: 1209324 },
	{ episodeId: 1209325 },
	{ episodeId: 1209326 },
	{ episodeId: 1209327 },
	{ episodeId: 1209328 },
	{ episodeId: 1209329 },
	{ episodeId: 1209330 },
	{ episodeId: 1403908 },
	{ episodeId: 1437006 },
	{ episodeId: 1437007 },
	{ episodeId: 1437008 },
	{ episodeId: 1437010 },
	{ episodeId: 1437011 },
	{ episodeId: 1437012 },
	{ episodeId: 1437014 },
	{ episodeId: 1437015 },
	{ episodeId: 1437016 },
	{ episodeId: 1437017 },
	{ episodeId: 1437019 },
	{ episodeId: 1437020 },
	{ episodeId: 1455055 },
	{ episodeId: 1455056 },
	{ episodeId: 1455057 },
	{ episodeId: 1455058 },
	{ episodeId: 1455059 },
	{ episodeId: 1455060 },
	{ episodeId: 1455061 },
	{ episodeId: 1455062 },
	{ episodeId: 1455063 },
	{ episodeId: 1455064 },
	{ episodeId: 1455065 },
	{ episodeId: 1455066 },
	{ episodeId: 1455067 },
	{ episodeId: 1419370 },
	{ episodeId: 1480153 },
	{ episodeId: 1497462 },
	{ episodeId: 1497463 },
	{ episodeId: 1497834 },
	{ episodeId: 1508514 },
	{ episodeId: 1515877 },
	{ episodeId: 1515876 },
	{ episodeId: 1518261 },
	{ episodeId: 1526687 },
	{ episodeId: 1215640 },
	{ episodeId: 1378905 },
	{ episodeId: 1390713 },
	{ episodeId: 1393196 },
	{ episodeId: 1399377 },
	{ episodeId: 1399378 },
	{ episodeId: 1399379 },
	{ episodeId: 1404444 },
	{ episodeId: 1404445 },
	{ episodeId: 1404446 },
	{ episodeId: 1575105 },
	{ episodeId: 1597865 },
	{ episodeId: 1597866 },
	{ episodeId: 1597867 },
	{ episodeId: 1597868 },
	{ episodeId: 1597869 },
	{ episodeId: 1597870 },
	{ episodeId: 1597871 },
	{ episodeId: 1597872 },
	{ episodeId: 1597873 },
	{ episodeId: 1597874 },
	{ episodeId: 1597875 },
	{ episodeId: 1597876 },
	{ episodeId: 1658202 },
	{ episodeId: 1675728 },
	{ episodeId: 1675729 },
	{ episodeId: 1675730 },
	{ episodeId: 1675731 },
	{ episodeId: 1675732 },
	{ episodeId: 1675733 },
	{ episodeId: 1675734 },
	{ episodeId: 1675735 },
	{ episodeId: 1675736 },
	{ episodeId: 1675737 },
	{ episodeId: 1675738 },
	{ episodeId: 1675739 },
	{ episodeId: 1377164 },
	{ episodeId: 1378310 },
	{ episodeId: 1397002 },
	{ episodeId: 1397003 },
	{ episodeId: 1397004 },
	{ episodeId: 1407271 },
	{ episodeId: 1408720 },
	{ episodeId: 1411774 },
	{ episodeId: 1416888 },
	{ episodeId: 1418736 },
	{ episodeId: 1431231 },
	{ episodeId: 1434147 },
	{ episodeId: 1437458 },
	{ episodeId: 1445522 },
	{ episodeId: 1449541 },
	{ episodeId: 1455051 },
	{ episodeId: 1459965 },
	{ episodeId: 1462484 },
	{ episodeId: 1467645 },
	{ episodeId: 1472410 },
	{ episodeId: 1472843 },
	{ episodeId: 1472849 },
	{ episodeId: 1526698 },
	{ episodeId: 1534349 },
	{ episodeId: 1534350 },
	{ episodeId: 1534351 },
	{ episodeId: 1534352 },
	{ episodeId: 1534353 },
	{ episodeId: 1534354 },
	{ episodeId: 1534355 },
	{ episodeId: 1534356 },
	{ episodeId: 1534357 },
	{ movieId: 363088 },
	{ movieId: 299536 },
	{ movieId: 299534 },
	{ episodeId: 1830976 },
	{ episodeId: 2293605 },
	{ episodeId: 2639816 },
	{ episodeId: 2639817 },
	{ episodeId: 2639818 },
	{ episodeId: 2639819 },
	{ episodeId: 2639820 },
	{ episodeId: 2639821 },
	{ episodeId: 2724621 },
	{ episodeId: 2431898 },
	{ episodeId: 2535021 },
	{ episodeId: 2535022 },
	{ episodeId: 2558741 },
	{ episodeId: 2558742 },
	{ episodeId: 2558743 },
	{ movieId: 429617 },
	{ episodeId: 2534997 },
	{ episodeId: 2927202 },
	{ episodeId: 2927203 },
	{ episodeId: 2927204 },
	{ episodeId: 2927205 },
	{ episodeId: 2927206 },
];

interface SpecialSeed {
	id: string;
	title: string;
	backdrop?: string | null;
	poster: string;
	logo?: string;
	description: string;
	Item: SpecialData[];
	creator: string;
};
export const special: SpecialSeed = {
	title: 'Marvel Cinematic Universe',
	backdrop: 'https://cdn.nomercy.tv/storage/images/clje9xd4v0000d4ef0usufhy9.jpg',
	logo: '/hUzeosd33nzE5MCNsZxCGEKTXaQ.png',
	poster: '/4Af70wDv1sN8JztUNnvXgae193O.jpg',
	description: 'Chronological order of the movies and episodes from the Marvel Cinematic Universe in the timeline of the story.',
	id: 'a2a32fd9-d62d-40a4-8e3f-d707dc66b2b2',
	Item: specialData,
	creator: 'Stoney_Eagle',
};