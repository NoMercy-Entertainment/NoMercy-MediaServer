import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const user = createSlice({
	name: 'user',
	initialState: {
		keycloakUrl: 'https://auth.nomercy.tv/realms/NoMercyTV/protocol/openid-connect/token',
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

export default user;
