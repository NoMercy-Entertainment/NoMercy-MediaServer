
import { store } from '..';
import { DisplayList, Lyric, MutedState, PlayState, Song, State } from '@server/types//music';
import content from './music';

export const setCurrentDevice = (payload: string) => store.dispatch(content.actions.setCurrentDevice(payload));

export const setState = (payload: State) => store.dispatch(content.actions.setState(payload));

export const setAudioElements = (payload: Array<HTMLAudioElement>) => store.dispatch(content.actions.setAudioElements(payload));
export const setCurrentAudio = (payload: HTMLAudioElement) => store.dispatch(content.actions.setCurrentAudio(payload));

export const setsrc = (payload: string | null) => store.dispatch(content.actions.setsrc(payload));

export const setVolume = (payload: number) => store.dispatch(content.actions.setVolume(payload));
export const setMutedState = (payload: MutedState) => store.dispatch(content.actions.setMutedState(payload));
export const setPlayState = (payload: PlayState) => store.dispatch(content.actions.setPlayState(payload));
export const setDuration = (payload: number) => store.dispatch(content.actions.setDuration(payload));
export const setCurrentTime = (payload: number) => store.dispatch(content.actions.setCurrentTime(payload));
export const setCurrentImage = (payload: string) => store.dispatch(content.actions.setCurrentImage(payload));
export const setPlaybackRate = (payload: number) => store.dispatch(content.actions.setPlaybackRate(payload));


export const setCurrentPlaylist = (payload: { id: string; type: string; }) => store.dispatch(content.actions.setCurrentPlaylist(payload));
export const setCurrentSong = (payload: Song) => store.dispatch(content.actions.setCurrentSong(payload));

export const setIsPlaying = (payload: boolean) => store.dispatch(content.actions.setIsPlaying(payload));
export const setIsPaused = (payload: boolean) => store.dispatch(content.actions.setIsPaused(payload));
export const setIsStopped = (payload: boolean) => store.dispatch(content.actions.setIsStopped(payload));
export const setIsMuted = (payload: boolean) => store.dispatch(content.actions.setIsMuted(payload));
export const setIsRepeating = (payload: boolean) => store.dispatch(content.actions.setIsRepeating(payload));
export const setIsSeeking = (payload: boolean) => store.dispatch(content.actions.setIsSeeking(payload));
export const setIsShuffling = (payload: boolean) => store.dispatch(content.actions.setIsShuffling(payload));

export const setMusicVisibility = (payload: 'hidden' | 'showing') => store.dispatch(content.actions.setMusicVisibility(payload));
export const setMusicSize = (payload: 'compact' | 'full') => store.dispatch(content.actions.setMusicSize(payload));

export const setShowLyrics = (payload: boolean) => store.dispatch(content.actions.setShowLyrics(payload));

export const setCurrentIndex = (payload: number) => store.dispatch(content.actions.setCurrentIndex(payload));
export const setFadeDuration = (payload: number) => store.dispatch(content.actions.setFadeDuration(payload));
export const setCrossfadeSteps = (payload: number) => store.dispatch(content.actions.setCrossfadeSteps(payload));
export const setFade = (payload: boolean) => store.dispatch(content.actions.setFade(payload));
export const setFadeInVolume = (payload: number) => store.dispatch(content.actions.setFadeInVolume(payload));
export const setFadeOutVolume = (payload: number) => store.dispatch(content.actions.setFadeOutVolume(payload));

export const setIsTransitioning = (payload: boolean) => store.dispatch(content.actions.setIsTransitioning(payload));
export const setLyrics = (payload: Array<Lyric> | string | null) => store.dispatch(content.actions.setLyrics(payload));
export const setNewSourceLoaded = (payload: boolean) => store.dispatch(content.actions.setNewSourceLoaded(payload));

export const setQueue = (payload: Array<Song> | undefined) => store.dispatch(content.actions.setQueue(payload));
export const addToQueue = (payload: Song) => store.dispatch(content.actions.addToQueue(payload));
export const pushToQueue = (payload: Song[]) => store.dispatch(content.actions.pushToQueue(payload));
export const removeFromQueue = (payload: Song) => store.dispatch(content.actions.removeFromQueue(payload));
export const addToQueueNext = (payload: Song) => store.dispatch(content.actions.addToQueueNext(payload));

export const setBackLog = (payload: Array<Song>) => store.dispatch(content.actions.setBackLog(payload));
export const addToBackLog = (payload: Song) => store.dispatch(content.actions.addToBackLog(payload));
export const pushToBackLog = (payload: Song[]) => store.dispatch(content.actions.pushToBackLog(payload));
export const removeFromBackLog = (payload: Song) => store.dispatch(content.actions.removeFromBackLog(payload));
export const addToBackLogNext = (payload: Song) => store.dispatch(content.actions.addToBackLogNext(payload));

export const setPlaylists = (payload: Array<any>) => store.dispatch(content.actions.setPlaylists(payload));
export const setIsCurrentDevice = (payload: boolean) => store.dispatch(content.actions.setIsCurrentDevice(payload));
export const setLockedPlayer = (payload: boolean) => store.dispatch(content.actions.setLockedPlayer(payload));
export const setSortType = (payload: string) => store.dispatch(content.actions.setSortType(payload));
export const setSortOrder = (payload: string) => store.dispatch(content.actions.setSortOrder(payload));
export const setFilteredList = (payload: Song[]) => store.dispatch(content.actions.setFilteredList(payload));
export const setDisplayList = (payload: DisplayList | null) => store.dispatch(content.actions.setDisplayList(payload));
