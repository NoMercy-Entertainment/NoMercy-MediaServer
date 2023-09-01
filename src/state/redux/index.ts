import { combineReducers, configureStore } from '@reduxjs/toolkit';

import config from './config';
import music from './music';
import system from './system';
// import user from './user';

export const appReducer = combineReducers({
	system: system.reducer,
	config: config.reducer,
	// user: user.reducer,
	music: music.reducer,
});

export type AppState = ReturnType<typeof appReducer>;

export const store = configureStore({
	reducer: appReducer,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export function useSelector<T>(selector: (state: AppState) => T) {
	return selector(store.getState());
}
