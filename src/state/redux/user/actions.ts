import { store } from '..';
import user from './user';

export const setAccessToken = (payload: string) => store.dispatch(user.actions.setAccessToken(payload));

export const setRefreshToken = (payload: string) => store.dispatch(user.actions.setRefreshToken(payload));

export const setExpiresIn = (payload: number) => store.dispatch(user.actions.setExpiresIn(payload));

export const setRefreshExpiresIn = (payload: number) => store.dispatch(user.actions.setRefreshExpiresIn(payload));

export const setTokenType = (payload: string) => store.dispatch(user.actions.setTokenType(payload));

export const setIdToken = (payload: string) => store.dispatch(user.actions.setIdToken(payload));

export const setNotBeforePolicy = (payload: number) => store.dispatch(user.actions.setNotBeforePolicy(payload));

export const setSessionState = (payload: string) => store.dispatch(user.actions.setSessionState(payload));

export const setScope = (payload: string) => store.dispatch(user.actions.setScope(payload));
