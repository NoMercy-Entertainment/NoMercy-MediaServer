import {
	createSlice,
	PayloadAction
} from '@reduxjs/toolkit';
import { existsSync } from 'fs';

import { makeMkv, mediaDbFile, subtitleEdit } from '../..';
import Device from 'chromecast-api/lib/device';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

export interface InitialState {
	database: string;
	internal_ip: string;
	external_ip: string;
	secureInternalPort: number;
	secureExternalPort: number;
	owner?: string;
	server_version: number;
	hasMakeMkv: boolean;
	hasSubtitleEdit: boolean;
	server: https.Server<typeof IncomingMessage, typeof ServerResponse>;
	socket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
	cast: Device[];
	clientList: any[];
}
export const initialState: InitialState = {
	database: mediaDbFile,
	internal_ip: '',
	external_ip: '',
	server_version: 2,
	secureInternalPort: parseInt(process.env.DEFAULT_PORT as string, 10),
	secureExternalPort: parseInt(process.env.DEFAULT_PORT as string, 10),
	owner: '',
	hasMakeMkv: existsSync(makeMkv),
	hasSubtitleEdit: existsSync(subtitleEdit),
	server: <https.Server<typeof IncomingMessage, typeof ServerResponse>>{},
	socket: <Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>{},
	clientList: [],
	cast: new Array<Device>(),
};

const system = createSlice({
	name: 'system',
	initialState: initialState,
	reducers: {
		setInternalIp: (state, action: PayloadAction<string>) => {
			state.internal_ip = action.payload;
		},
		setExternalIp: (state, action: PayloadAction<string>) => {
			state.external_ip = action.payload;
		},
		setClientList: (state, action: PayloadAction<any[]>) => {
			state.clientList = action.payload;
		},
		setSecureInternalPort: (state, action: PayloadAction<number>) => {
			state.secureInternalPort = action.payload;
		},
		setSecureExternalPort: (state, action: PayloadAction<number>) => {
			state.secureExternalPort = action.payload;
		},
		setOwner: (state, action: PayloadAction<string>) => {
			state.owner = action.payload;
		},
		setHasMakeMkv: (state, action: PayloadAction<boolean>) => {
			state.hasMakeMkv = action.payload;
		},
		setHasSubtitleEdit: (state, action: PayloadAction<boolean>) => {
			state.hasSubtitleEdit = action.payload;
		},
		setHttpsServer: (state, action: PayloadAction<https.Server<typeof IncomingMessage, typeof ServerResponse>>) => {
			state.server = action.payload;
		},
		setSocketServer: (state, action: PayloadAction<Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>>) => {
			state.socket = action.payload;
		},
		setCast: (state, action: PayloadAction<Device[]>) => {
			state.cast = action.payload;
		},
	},
});

export default system;
