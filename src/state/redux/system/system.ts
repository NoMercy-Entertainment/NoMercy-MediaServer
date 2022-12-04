import https, { Server } from 'https';
import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { existsSync } from 'fs';
import { Http2SecureServer } from 'http2';

import { libraryDb, makeMkv, subtitleEdit } from '../..';
import { SocketIoServer } from '../../../loaders/socket';

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
	server: Http2SecureServer;
	socket: SocketIoServer;
	clientList: any[];
}
export const initialState: InitialState = {
	database: libraryDb,
	internal_ip: '',
	external_ip: '',
	server_version: 2,
	secureInternalPort: parseInt(process.env.DEFAULT_PORT as string, 10),
	secureExternalPort: parseInt(process.env.DEFAULT_PORT as string, 10),
	owner: '',
	hasMakeMkv: existsSync(makeMkv),
	hasSubtitleEdit: existsSync(subtitleEdit),
	server: new https.Server(),
	socket: <SocketIoServer>{},
	clientList: [],
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
		setHttpsServer: (state, action: PayloadAction<Http2SecureServer>) => {
			state.server = action.payload;
		},
		setSocketServer: (state, action: PayloadAction<SocketIoServer>) => {
			state.socket = action.payload;
		},
	},
});

export default system;
