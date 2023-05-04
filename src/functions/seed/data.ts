import { ConfigData } from 'types/server';
import { deviceName } from '../system';

export const configData: ConfigData = {
	secureInternalPort: process.env.DEFAULT_PORT ?? 7635,
	secureExternalPort: process.env.DEFAULT_PORT ?? 7635,
	deviceName: deviceName,
	queueWorkers: 2,
	cronWorkers: 1,
	dataWorkers: 15,
	requestWorkers: 1,
};

export const notificationData: { [arg: string]: boolean } = {
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
	autoRefreshInterval: string;
	chapterImages: boolean;
	extractChaptersDuring: boolean;
	extractChapters: boolean;
	perfectSubtitleMatch: boolean;
	folders: {
		id: string;
	}[];
}
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
		autoRefreshInterval: '30',
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1n0000qwefaltp4913',
			},
		],
	},
	{
		id: 'cl7i4km1o0006qwefdx5neusi',
		image: '/nWwwRVsnVpmlZMob6y19R96YldR.jpg',
		title: 'Films',
		type: 'movie',
		language: 'nl',
		country: 'NL',
		specialSeasonName: 'Specials',
		realtime: true,
		autoRefreshInterval: '30',
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1o0001qwefarqd8r0q',
			},
		],
	},
	{
		id: 'cl7i4km1o0008qwef7qwdapxe',
		image: '/rfGg1ZLNvlfTfiY5941IFjEKMK1.jpg',
		title: 'Series',
		type: 'tv',
		language: 'nl',
		country: 'NL',
		specialSeasonName: 'Specials',
		realtime: true,
		autoRefreshInterval: '30',
		chapterImages: true,
		extractChaptersDuring: true,
		extractChapters: true,
		perfectSubtitleMatch: true,
		folders: [
			{
				id: 'cl7i4km1o0002qwef0xv15b15',
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
		autoRefreshInterval: '30',
		chapterImages: false,
		extractChaptersDuring: false,
		extractChapters: false,
		perfectSubtitleMatch: false,
		folders: [
			{
				id: 'cl7i4km1o0003qwef44qpen9z',
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
	// 	autoRefreshInterval: '30',
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
	// 	autoRefreshInterval: '30',
	// 	chapterImages: true,
	// 	extractChaptersDuring: true,
	// 	extractChapters: true,
	// 	perfectSubtitleMatch: true,
	// 	folders: [],
	// },
];
