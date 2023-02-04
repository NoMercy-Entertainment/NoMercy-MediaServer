import {
	ActivityLog,
	ConfigData,
	Device,
	ServerTask
} from 'types/server';

import {
	byObjectValues
} from '../../functions/stringArray';
import { deviceName } from '../system';

export const configData: ConfigData = {
	// key : value
	secureInternalPort: process.env.DEFAULT_PORT ?? 7635,
	secureExternalPort: process.env.DEFAULT_PORT ?? 7635,
	deviceName: deviceName,
	queueWorkers: 2,
	cronWorkers: 1,
};

export const notificationData: { [arg: string]: boolean } = {
	// name : manage
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
		params: [
			{
				key: '-c:v',
				val: 'libx264',
			},
			{
				key: '-crf',
				val: '20',
			},
			{
				key: '-c:a',
				val: 'aac',
			},
			{
				key: '-s',
				val: '3840:-2',
			},
			{
				key: '-preset',
				val: 'veryfast',
			},
			{
				key: '-profile',
				val: 'high',
			},
			{
				key: '-tune',
				val: 'film',
			},
			{
				key: '-level',
				val: '5.2',
			},
		],
	},
	{
		id: 'cl7i4o7v7001kqwef32im51hk',
		name: '1080p high',
		container: 'auto',
		params: [
			{
				key: '-c:v',
				val: 'libx264',
			},
			{
				key: '-crf',
				val: '20',
			},
			{
				key: '-c:a',
				val: 'aac',
			},
			{
				key: '-s',
				val: '1920:-2',
			},
			{
				key: '-preset',
				val: 'veryfast',
			},
			{
				key: '-profile',
				val: 'high',
			},
			{
				key: '-tune',
				val: 'film',
			},
			{
				key: '-level',
				val: '5.2',
			},
		],
	},
	{
		id: 'cl7i4o7v7001lqwefcnljgy5o',
		name: '1080p regular',
		container: 'auto',
		params: [
			{
				key: '-c:v',
				val: 'libx264',
			},
			{
				key: '-crf',
				val: '23',
			},
			{
				key: '-c:a',
				val: 'aac',
			},
			{
				key: '-s',
				val: '1920:-2',
			},
			{
				key: '-preset',
				val: 'veryfast',
			},
			{
				key: '-profile',
				val: 'high',
			},
			{
				key: '-tune',
				val: 'film',
			},
			{
				key: '-level',
				val: '5.2',
			},
		],
	},
];

interface Folder {
	id: string;
	path: string;
}
export const folders: Folder[] = [
	{
		id: 'cl7i4km1n0000qwefaltp4913',
		path: 'M:\\Anime\\Anime',
	},
	{
		id: 'cl7i4km1o0001qwefarqd8r0q',
		path: 'M:\\Films\\Films',
	},
	{
		id: 'cl7i4km1o0002qwef0xv15b15',
		path: 'M:\\TV.Shows\\TV.Shows',
	},
	{
		id: 'cl7i4km1o0003qwef44qpen9z',
		path: 'M:\\Music',
	},
	// {
	// 	id: 'cl7i4km1n0000qwefaltp4913',
	// 	path: 'Z:\\mnt\\m\\Anime\\Anime',
	// },
	// {
	// 	id: 'cl7i4km1o0001qwefarqd8r0q',
	// 	path: 'Z:\\mnt\\m\\Films\\Films',
	// },
	// {
	// 	id: 'cl7i4km1o0002qwef0xv15b15',
	// 	path: 'Z:\\mnt\\m\\TV.Shows\\TV.Shows',
	// },
	// {
	// 	id: 'cl7i4km1o0003qwef44qpen9z',
	// 	path: 'Z:\\mnt\\m\\Music',
	// },
];

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
		id: 'cl7i4km1o000aqweffmongx0u',
		image: null,
		title: 'Collections',
		type: 'collection',
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
			{
				id: 'cl7i4km1o0001qwefarqd8r0q',
			},
			{
				id: 'cl7i4km1o0002qwef0xv15b15',
			},
		],
	},
	{
		id: 'cl7i4km1o000eqwefeej91x9g',
		image: null,
		title: 'Specials',
		type: 'special',
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
			{
				id: 'cl7i4km1o0001qwefarqd8r0q',
			},
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
];

const version = 'NoMercy web 0.0.1';
export const devices: Device[] = [
	// {
	// 	id: 'cl7i4km1o000kqwefbugyeqs4',
	// 	deviceId: 'cl7i4km1o000lqwef9bpm4okw',
	// 	title: 'Android',
	// 	type: 'Android',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1o000mqwef10se91xl',
	// 	deviceId: 'cl7i4km1p000nqwef4pek2f4t',
	// 	title: 'Apple',
	// 	type: 'Apple',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000oqwefb2d09eaq',
	// 	deviceId: 'cl7i4km1p000pqwef1ifmhsxy',
	// 	title: 'Chrome (web)',
	// 	type: 'Chrome',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000qqwefhl7u9f5b',
	// 	deviceId: 'cl7i4km1p000rqwef1wz6bj14',
	// 	title: 'Edge',
	// 	type: 'Edge',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000sqwefbx5qflt6',
	// 	deviceId: 'cl7i4km1p000tqwef7fza0jck',
	// 	title: 'Edge Chromium',
	// 	type: 'Edge Chromium',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000uqwef8qrf2xxd',
	// 	deviceId: 'cl7i4km1p000vqwef2m6d8v7y',
	// 	title: 'Firefox',
	// 	type: 'Firefox',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000wqwefdqg340tq',
	// 	deviceId: 'cl7i4km1p000xqwef5s16423y',
	// 	title: 'Html5',
	// 	type: 'Html5',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p000yqwef36918h8b',
	// 	deviceId: 'cl7i4km1p000zqweff0bs0wvw',
	// 	title: 'Kodi',
	// 	type: 'Kodi',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p0010qwef4jfyhmor',
	// 	deviceId: 'cl7i4km1p0011qwef1xv3gldv',
	// 	title: 'Msie',
	// 	type: 'Msie',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p0012qwef17htdozh',
	// 	deviceId: 'cl7i4km1p0013qwefgs0k7nsq',
	// 	title: 'Opera',
	// 	type: 'Opera',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p0014qwefhwylhsa5',
	// 	deviceId: 'cl7i4km1p0015qwef5n530gkm',
	// 	title: 'Other',
	// 	type: 'Other',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p0016qwefdcalbu25',
	// 	deviceId: 'cl7i4km1p0017qwefbox7hxdx',
	// 	title: 'Playstation',
	// 	type: 'Playstation',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p0018qwef6sgn55is',
	// 	deviceId: 'cl7i4km1p0019qwefchiqg1uw',
	// 	title: 'Safari',
	// 	type: 'Safari',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p001aqwefcz51553u',
	// 	deviceId: 'cl7i4km1p001bqwef40q1684z',
	// 	title: 'Samsung TV',
	// 	type: 'Samsung TV',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p001cqwefddftdkt8',
	// 	deviceId: 'cl7i4km1p001dqwef2gfb1mxs',
	// 	title: 'Windows',
	// 	type: 'Windows',
	// 	version: version,
	// },
	// {
	// 	id: 'cl7i4km1p001eqwef51nehv0j',
	// 	deviceId: 'cl7i4km1p001fqwefg14k55vd',
	// 	title: 'Xbox',
	// 	type: 'Xbox',
	// 	version: version,
	// },
].sort(byObjectValues(['title', 'type']));

export const serverTasks: ServerTask[] = [
	// {
	// 	id: 'cl7i4km1p001gqwefcdnb9tju',
	// 	title: 'Scan media library',
	// 	value: 69,
	// 	type: 'library',
	// },
	// {
	// 	id: 'cl7i4km1p001hqwefbyo8c9hm',
	// 	title: 'Checking external services for updated content with a veeeeeery long text ',
	// 	value: 51,
	// 	type: 'database',
	// },
];

const ips = ['127.0.0.1', '192.168.2.201', '192.168.2.80', '86.92.205.45', '218.19.27.169'];
const types = [
	'SessionStarted',
	'SessionEnded',
	'AudioPlayback',
	'AudioPlaybackStopped',
	'VideoPlayback',
	'VideoPlaybackStopped',
	'UserDownloadingContent',
];

export const activityLog = async (): Promise<ActivityLog[]> => {
	// const users = await confDb.user.findMany();
	// const activityLog = await confDb.activityLog.findMany();
	// // console.log(users);
	// if (activityLog.length < 30 && users.length > 0) {
	// 	return [...Array(15)]
	// 		.map(() => {
	// 			return {
	// 				sub_id: users[Math.floor(Math.random() * users.length)].sub_id,
	// 				deviceId: devices[Math.floor(Math.random() * devices.length)].id,
	// 				type: types[Math.floor(Math.random() * types.length)],
	// 				time: randomDate(new Date(2022, 6, 1), new Date()),
	// 				from: ips[Math.floor(Math.random() * ips.length)],
	// 			};
	// 		})
	// 		.sort((a: { time: number }, b: { time: number }) => b.time - a.time);
	// } else {
		return [];
	// }
};

function randomDate(start: Date, end: Date) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime();
}
