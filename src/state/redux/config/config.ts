
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '../../../database/config/client';
import { LibraryWithFolders } from '../../../database/data';
import { PreferredOrder } from '../../../encoder/ffprobe/ffprobe';
import { ChromeCast } from '../../../functions/chromeCast/chromeCast';
import { Queue } from '../../../functions/queue/QueueClass';
import { deviceName } from '../../../functions/system';
import { CDNInfoResponse, Files } from '../../../types/cdn';

export const keepOriginal: { [arg: string]: boolean } = {
	audio: true,
	subtitles: true,
};

const initialState = {
	allowedUsers: new Array<AllowedUser>(),
	colors: <CDNInfoResponse['data']['colors']>{},
	deviceName: deviceName,
	downloads: new Array<Files>(),
	keycloakCertificate: '',
	makemkv_key: '',
	moderators: new Array<{ id: string; name: string }>(),
	omdb_apikey: '',
	openServer: false,
	quote: '',
	tmdb_apikey: '',
	users: new Array<User>(),

	chromeCast: <ChromeCast>{},

	queueWorker: new Queue({ name: 'queue', workers: 1 }),
	queueWorkers: 1,
	cronWorker: new Queue({ name: 'cron', workers: 1 }),
	cronWorkers: 1,
	dataWorker: new Queue({ name: 'data', workers: 1 }),
	dataWorkers: 1,
	requestWorker: new Queue({ name: 'request', workers: 1 }),
	requestWorkers: 1,
	encoderWorker: new Queue({ name: 'request', workers: 1 }),
	encoderWorkers: 1,

	libraries: new Array<LibraryWithFolders>(),
	preferredOrder: <PreferredOrder>{},
	keepOriginal: keepOriginal,
	assToVtt: true,

	language: 'en',

};

const config = createSlice({
	initialState: initialState,
	name: 'config',
	reducers: {
		setTmdbApiKey: (state, action: PayloadAction<string>) => {
			state.tmdb_apikey = action.payload;
		},
		setOmdbApiKey: (state, action: PayloadAction<string>) => {
			state.omdb_apikey = action.payload;
		},
		setMakeMKVKey: (state, action: PayloadAction<string>) => {
			state.makemkv_key = action.payload;
		},
		setLanguage: (state, action: PayloadAction<string>) => {
			state.language = action.payload;
		},
		setQuote: (state, action: PayloadAction<string>) => {
			state.quote = action.payload;
		},
		setColors: (state, action: PayloadAction<CDNInfoResponse['data']['colors']>) => {
			state.colors = action.payload;
		},
		setDownloads: (state, action: PayloadAction<Array<Files>>) => {
			state.downloads = action.payload;
		},
		setModerators: (state, action: PayloadAction<{ id: string; name: string }[]>) => {
			state.moderators = action.payload;
		},
		setUsers: (state, action: PayloadAction<User[]>) => {
			state.users = action.payload;
		},
		setAllowedUsers: (state, action: PayloadAction<Array<AllowedUser>>) => {
			state.allowedUsers = action.payload;
		},
		setDeviceName: (state, action: PayloadAction<string>) => {
			state.deviceName = action.payload;
		},
		setLibraries: (state, action: PayloadAction<any>) => {
			state.libraries = action.payload;
		},
		setPreferedOrder: (state, action: PayloadAction<PreferredOrder>) => {
			state.preferredOrder = action.payload;
		},
		setKeepOriginal: (state, action: PayloadAction<{[arg: string]: any}>) => {
			state.keepOriginal = action.payload;
		},
		setAssToVtt: (state, action: PayloadAction<boolean>) => {
			state.assToVtt = action.payload;
		},
		setKeycloakCertificate: (state, action: PayloadAction<string>) => {
			state.keycloakCertificate = action.payload;
		},
		setChromeCast: (state, action: PayloadAction<ChromeCast>) => {
			// @ts-expect-error
			state.chromeCast = action.payload;
		},
		// setQueueWorkers: (state, action: PayloadAction<number>) => {
		// 	state.queueWorkers = action.payload;
		// },
		// setCronWorkers: (state, action: PayloadAction<number>) => {
		// 	state.cronWorkers = action.payload;
		// },
	},
});

export default config;

export interface DefaultUserOptions {
	owner: boolean;
	manage: boolean;
	allowed: boolean;
	audioTranscoding: boolean;
	videoTranscoding: boolean;
	noTranscoding: boolean;
}

export const defaultUserOptions: DefaultUserOptions = {
	manage: false,
	owner: false,
	allowed: false,
	audioTranscoding: false,
	videoTranscoding: false,
	noTranscoding: false,
};

// export interface User extends DefaultUserOptions {
// 	sub_id: string;
// 	email: string;
// 	name: string;
// }

export interface AllowedUser {
	sub_id: string;
	email: string;
	manage: boolean | null;
	owner: boolean | null;
	name: string;
	allowed: boolean | null;
	audioTranscoding: boolean | null;
	videoTranscoding: boolean | null;
	noTranscoding: boolean | null;
	created_at?: number;
	updated_at?: number;
}
