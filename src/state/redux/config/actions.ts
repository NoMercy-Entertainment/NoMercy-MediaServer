import { CDNInfoResponse, Files } from 'types/cdn';
import config, { AllowedUser } from '.';

import { User } from '../../../database/config/client';
import { store } from '..';

export const setTmdbApiKey = (payload: string) => store.dispatch(config.actions.setTmdbApiKey(payload));

export const setOmdbApiKey = (payload: string) => store.dispatch(config.actions.setOmdbApiKey(payload));

export const setMakeMKVKey = (payload: string) => store.dispatch(config.actions.setMakeMKVKey(payload));

export const setQuote = (payload: string) => store.dispatch(config.actions.setQuote(payload));

export const setColors = (payload: CDNInfoResponse['data']['colors']) => store.dispatch(config.actions.setColors(payload));

export const setDownloads = (payload: Array<Files>) => store.dispatch(config.actions.setDownloads(payload));

export const setModerators = (payload: { id: string; name: string }[]) => store.dispatch(config.actions.setModerators(payload));

export const setUsers = (payload: User[]) => store.dispatch(config.actions.setUsers(payload));

export const setAllowedUsers = (payload: Array<AllowedUser>) => store.dispatch(config.actions.setAllowedUsers(payload));

export const setDeviceName = (payload: string) => store.dispatch(config.actions.setDeviceName(payload));

export const setLibraries = (payload: any) => store.dispatch(config.actions.setLibraries(payload));

export const setKeepOriginal = (payload: {[arg: string]: any}) => store.dispatch(config.actions.setKeepOriginal(payload));

export const setAssToVtt = (payload: boolean) => store.dispatch(config.actions.setAssToVtt(payload));

export const setKeycloakCertificate = (payload: string) => store.dispatch(config.actions.setKeycloakCertificate(payload));

// export const setQueueWorkers = (payload: number) => store.dispatch(config.actions.setQueueWorkers(payload));

// export const setCronWorkers = (payload: number) => store.dispatch(config.actions.setCronWorkers(payload));
