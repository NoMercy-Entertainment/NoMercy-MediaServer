import { ListItem, MutedState, PlayState, Song, State } from 'types/music';

import music from './music';
import { store } from '..';

export const setState = (payload: State) => store.dispatch(music.actions.setState(payload));

export const setHome = (payload: any) => store.dispatch(music.actions.setHome(payload));

export const setFadeDuration = (payload: any) => store.dispatch(music.actions.setFadeDuration(payload));

export const setCurrentItemIndex = (payload: number) => store.dispatch(music.actions.setCurrentItemIndex(payload));

export const setIsCurrentDevice = (payload: boolean) => store.dispatch(music.actions.setIsCurrentDevice(payload));

export const setPlayState = (payload: PlayState) => store.dispatch(music.actions.setPlayState(payload));

export const setMutedState = (payload: MutedState) => store.dispatch(music.actions.setMutedState(payload));

export const setVolumeState = (payload: number) => store.dispatch(music.actions.setVolumeState(payload));

export const setPositionState = (payload: number) => store.dispatch(music.actions.setPositionState(payload));

export const setDurationState = (payload: number) => store.dispatch(music.actions.setDurationState(payload));

export const setLyrics = (payload: string) => store.dispatch(music.actions.setLyrics(payload));

export const setShowLyrics = (payload: boolean) => store.dispatch(music.actions.setShowLyrics(payload));

export const setArtists = (payload: any) => store.dispatch(music.actions.setArtists(payload));

export const setAlbums = (payload: any) => store.dispatch(music.actions.setAlbums(payload));

export const setLikedSongs = (payload: any) => store.dispatch(music.actions.setLikedSongs(payload));

export const setPlaylists = (payload: any) => store.dispatch(music.actions.setPlaylists(payload));

export const setDisplayList = (payload: ListItem) => store.dispatch(music.actions.setDisplayList(payload));

export const setCurrentItem = (payload: Song) => store.dispatch(music.actions.setCurrentItem(payload));

export const setQueue = (payload: Song[]) => store.dispatch(music.actions.setQueue(payload));

export const addToQueue = (payload: Song) => store.dispatch(music.actions.addToQueue(payload));

export const pushToQueue = (payload: Song[]) => store.dispatch(music.actions.pushToQueue(payload));

export const removeFromQueue = (payload: Song) => store.dispatch(music.actions.removeFromQueue(payload));

export const addToQueueNext = (payload: Song) => store.dispatch(music.actions.addToQueueNext(payload));

export const setBackLog = (payload: Song[]) => store.dispatch(music.actions.setBackLog(payload));

export const addToBackLog = (payload: Song) => store.dispatch(music.actions.addToBackLog(payload));

export const pushToBackLog = (payload: Song[]) => store.dispatch(music.actions.pushToBackLog(payload));

export const removeFromBackLog = (payload: Song) => store.dispatch(music.actions.removeFromBackLog(payload));

export const addToBackLogNext = (payload: Song) => store.dispatch(music.actions.addToBackLogNext(payload));

export const setAudioElement = (payload: HTMLAudioElement) => store.dispatch(music.actions.setAudioElement(payload));

export const setCurrentDevice = (payload: string) => store.dispatch(music.actions.setCurrentDevice(payload));
