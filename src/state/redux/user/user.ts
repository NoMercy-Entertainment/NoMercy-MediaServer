import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readFileSync } from 'fs';
import { tokenFile } from '../..';
import { store } from '..';

const user = createSlice({
	name: 'user',
	initialState: {
		keycloakUrl: 'https://auth.nomercy.tv/auth/realms/NoMercyTV/protocol/openid-connect/token',
		access_token: '',
		refresh_token: '',
		expires_in: 7200,
		refresh_expires_in: 0,
		token_type: 'Bearer',
		id_token: '',
		'not-before-policy': 0,
		session_state: '',
		scope: '',
	},
	reducers: {
		setAccessToken: (state, action: PayloadAction<string>) => {
			state.access_token = action.payload;
		},
		setRefreshToken: (state, action: PayloadAction<string>) => {
			state.refresh_token = action.payload;
		},
		setExpiresIn: (state, action: PayloadAction<number>) => {
			state.expires_in = action.payload;
		},
		setRefreshExpiresIn: (state, action: PayloadAction<number>) => {
			state.refresh_expires_in = action.payload;
		},
		setTokenType: (state, action: PayloadAction<string>) => {
			state.token_type = action.payload;
		},
		setIdToken: (state, action: PayloadAction<string>) => {
			state.id_token = action.payload;
		},
		setNotBeforePolicy: (state, action: PayloadAction<number>) => {
			state['not-before-policy'] = action.payload;
		},
		setSessionState: (state, action: PayloadAction<string>) => {
			state.session_state = action.payload;
		},
		setScope: (state, action: PayloadAction<string>) => {
			state.scope = action.payload;
		},
	},
});

export const setAccessToken = (payload: string) => store.dispatch(user.actions.setAccessToken(payload));

export const setRefreshToken = (payload: string) => store.dispatch(user.actions.setRefreshToken(payload));

export const setExpiresIn = (payload: number) => store.dispatch(user.actions.setExpiresIn(payload));

export const setRefreshExpiresIn = (payload: number) => store.dispatch(user.actions.setRefreshExpiresIn(payload));

export const setTokenType = (payload: string) => store.dispatch(user.actions.setTokenType(payload));

export const setIdToken = (payload: string) => store.dispatch(user.actions.setIdToken(payload));

export const setNotBeforePolicy = (payload: number) => store.dispatch(user.actions.setNotBeforePolicy(payload));

export const setSessionState = (payload: string) => store.dispatch(user.actions.setSessionState(payload));

export const setScope = (payload: string) => store.dispatch(user.actions.setScope(payload));

export default user;
