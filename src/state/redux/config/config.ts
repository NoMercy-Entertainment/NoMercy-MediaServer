
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { PreferredOrder } from '../../../encoder/ffprobe/ffprobe';
import { ChromeCast } from '@server/functions/chromeCast/chromeCast';
import { DatabaseQueue } from '@server/functions/queue/DatabaseQueueClass';
import { deviceName } from '@server/functions/system';
import { CDNInfoResponse, Files } from '../../../types/cdn';
import { SyncQueue } from '@server/functions/queue/SyncQueueClass';
import { User } from '@server/db/media/actions/users';
import { LibraryWithRelations } from '@server/db/media/actions/libraries';

export const keepOriginal: { [arg: string]: boolean } = {
	audio: true,
	subtitles: true,
};

const initialState = {
	allowedUsers: new Array<AllowedUser>(),
	colors: <CDNInfoResponse['data']['colors']>{},
	deviceName: deviceName,
	downloads: new Array<Files>(),
	makemkv_key: '',
	acoustic_id: '',
	moderators: new Array<{ id: string; name: string }>(),
	omdb_apikey: '',
	openServer: false,
	quote: '',
	tmdb_apikey: '',
	users: new Array<User>(),

	chromeCast: <ChromeCast>{},

	queueWorker: new DatabaseQueue({ name: 'queue', workers: 1 }),
	queueWorkers: 1,
	cronWorker: new DatabaseQueue({ name: 'cron', workers: 1 }),
	cronWorkers: 1,
	dataWorker: new DatabaseQueue({ name: 'data', workers: 1 }),
	dataWorkers: 1,
	requestWorker: new SyncQueue({ name: 'request', workers: 1 }),
	requestWorkers: 1,
	encoderWorker: new DatabaseQueue({ name: 'encoder', workers: 1 }),
	encoderWorkers: 1,

	libraries: new Array<LibraryWithRelations>(),
	preferredOrder: <PreferredOrder>{},
	keepOriginal: keepOriginal,
	assToVtt: true,

	language: 'en',

	publicKey: '',
	clientId: '',
	clientSecret: '',

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
		setAcousticId: (state, action: PayloadAction<string>) => {
			state.acoustic_id = action.payload;
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
		setPublicKey: (state, action: PayloadAction<string>) => {
			state.publicKey = action.payload;
		},
		setClientId: (state, action: PayloadAction<string>) => {
			state.clientId = action.payload;
		},
		setClientSecret: (state, action: PayloadAction<string>) => {
			state.clientSecret = action.payload;
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
	id: string;
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
