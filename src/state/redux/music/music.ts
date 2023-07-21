import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DisplayList, Lyric, MutedState, PlayState, Song, State } from '@server/types//music';


export const initialmusicPlayerState: musicPlayerState = {
	currentDevice: null as string | null,
	state: State.idle,
	audioElements: new Array<HTMLAudioElement>(),
	backLog: new Array<Song>(),
	crossfadeSteps: 0,
	currentAudio: <HTMLAudioElement>{},
	currentSong: <Song>{},
	currentTime: 0,
	currentPlaylist: <DisplayList>{},
	duration: 0,
	fade: false,
	fadeInVolume: 0,
	fadeOutVolume: 0,
	isMuted: false,
	isPaused: false,
	isPlaying: false,
	isRepeating: false,
	isSeeking: false,
	isShuffling: false,
	isStopped: true,
	isTransitioning: false,
	lyrics: null,
	mutedState: MutedState.unmuted,
	newSourceLoaded: false,
	playbackRate: 1,
	playState: PlayState.paused,
	progress: 0,
	progressPercentage: 0,
	queue: new Array<Song>(),
	showLyrics: false,
	musicVisibility: 'hidden',
	musicSize: 'compact',
	src: null,
	volume: 0,
	fadeDuration: 3,
	currentIndex: -1,
	playlists: new Array<any>(),
	displayList: <DisplayList>{},
	filteredList: [],
	sortType: 'index',
	sortOrder: 'asc',
	lockedPlayer: false,
	isCurrentDevice: false,
	currentImage: null,
};

export interface musicPlayerState {
  currentDevice: string | null;
  state: State;
  audioElements: Array<HTMLAudioElement>;
  backLog: Array<Song>;
  crossfadeSteps: number;
  currentAudio: HTMLAudioElement;
  currentSong: Song;
  currentTime: number;
  currentPlaylist: {
    id: string;
    type: string;
  };
  duration: number;
  fade: boolean;
  fadeInVolume: number;
  fadeOutVolume: number;
  isMuted: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  isRepeating: boolean;
  isSeeking: boolean;
  isShuffling: boolean;
  isStopped: boolean;
  isTransitioning: boolean;
  lyrics: Array<Lyric> | string | null;
  musicVisibility: 'hidden' | 'showing';
  mutedState: MutedState;
  newSourceLoaded: boolean;
  playbackRate: number;
  playState: PlayState;
  progress: number;
  progressPercentage: number;
  queue: Array<Song>;
  showLyrics: boolean;
  musicSize: 'compact' | 'full';
  src: string | null;
  volume: number;
  fadeDuration: number;
  currentIndex: number;
  playlists: Array<any>,
  displayList: DisplayList | null,
  filteredList: Array<Song> | null,
  sortType: string,
  sortOrder: string,
  lockedPlayer: boolean,
  isCurrentDevice: boolean,
  currentImage: string | null,
}

const musicPlayer = createSlice({
	name: 'music',
	initialState: initialmusicPlayerState,
	reducers: {
		setCurrentDevice: (state, action: PayloadAction<string | null>) => {
			state.currentDevice = action.payload;
		},
		setState: (state, action: PayloadAction<State>) => {
			state.state = action.payload;
		},
		setAudioElements: (state, action: PayloadAction<Array<HTMLAudioElement>>) => {
			// @ts-ignore
			state.audioElements = action.payload;
		},
		setCurrentAudio: (state, action: PayloadAction<HTMLAudioElement>) => {
			// @ts-ignore
			state.currentAudio = action.payload;
		},
		setsrc: (state, action: PayloadAction<string | null>) => {
			state.src = action.payload;
		},
		setCurrentSong: (state, action: PayloadAction<Song>) => {
			state.currentSong = action.payload;
		},
		setMusicVisibility: (state, action: PayloadAction<'hidden' | 'showing'>) => {
			state.musicVisibility = action.payload;
		},
		setMusicSize: (state, action: PayloadAction<'compact' | 'full'>) => {
			state.musicSize = action.payload;
		},
		setIsPlaying: (state, action: PayloadAction<boolean>) => {
			state.isPlaying = action.payload;
		},
		setFadeDuration: (state, action: PayloadAction<number>) => {
			state.fadeDuration = action.payload;
		},
		setCurrentIndex: (state, action: PayloadAction<number>) => {
			state.currentIndex = action.payload;
		},
		setIsPaused: (state, action: PayloadAction<boolean>) => {
			state.isPaused = action.payload;
		},
		setIsStopped: (state, action: PayloadAction<boolean>) => {
			state.isStopped = action.payload;
		},
		setIsMuted: (state, action: PayloadAction<boolean>) => {
			state.isMuted = action.payload;
		},
		setIsRepeating: (state, action: PayloadAction<boolean>) => {
			state.isRepeating = action.payload;
		},
		setIsShuffling: (state, action: PayloadAction<boolean>) => {
			state.isShuffling = action.payload;
		},
		setVolume: (state, action: PayloadAction<number>) => {
			state.volume = action.payload;
		},
		setPlaybackRate: (state, action: PayloadAction<number>) => {
			state.playbackRate = action.payload;
		},
		setCurrentTime: (state, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
		},
		setDuration: (state, action: PayloadAction<number>) => {
			state.duration = action.payload;
		},
		setIsSeeking: (state, action: PayloadAction<boolean>) => {
			state.isSeeking = action.payload;
		},
		setMutedState: (state, action: PayloadAction<MutedState>) => {
			state.mutedState = action.payload;
		},
		setPlayState: (state, action: PayloadAction<PlayState>) => {
			state.playState = action.payload;
		},
		setCurrentPlaylist: (state, action: PayloadAction<{ id: string; type: string; }>) => {
			state.currentPlaylist = action.payload;
		},
		setLyrics: (state, action: PayloadAction<Array<Lyric> | string | null>) => {
			state.lyrics = action.payload;
		},
		setShowLyrics: (state, action: PayloadAction<boolean>) => {
			state.showLyrics = action.payload;
		},
		setFadeInVolume: (state, action: PayloadAction<number>) => {
			state.fadeInVolume = action.payload;
		},
		setCrossfadeSteps: (state, action: PayloadAction<number>) => {
			state.crossfadeSteps = action.payload;
		},
		setFadeOutVolume: (state, action: PayloadAction<number>) => {
			state.fadeOutVolume = action.payload;
		},
		setNewSourceLoaded: (state, action: PayloadAction<boolean>) => {
			state.newSourceLoaded = action.payload;
		},
		setFade: (state, action: PayloadAction<boolean>) => {
			state.fade = action.payload;
		},
		setIsTransitioning: (state, action: PayloadAction<boolean>) => {
			state.isTransitioning = action.payload;
		},

		setQueue: (state, action: PayloadAction<Song[] | undefined>) => {
			state.queue = action.payload ?? [];
		},
		addToQueue: (state, action: PayloadAction<Song>) => {
			state.queue = [...state.queue, action.payload];
		},
		pushToQueue: (state, action: PayloadAction<Song[]>) => {
			state.queue = [...state.queue, ...action.payload];
		},
		addToQueueNext: (state, action: PayloadAction<Song>) => {
			state.queue = [action.payload, ...state.queue];
		},
		removeFromQueue: (state, action: PayloadAction<Song>) => {
			if (action.payload) {
				state.backLog = [...(state.backLog ?? []), state.currentSong];
			}
			state.queue = state.queue?.filter(q => q?.id != action.payload?.id);
		},

		setBackLog: (state, action: PayloadAction<Song[]>) => {
			state.backLog = action.payload;
		},
		addToBackLog: (state, action: PayloadAction<Song>) => {
			state.backLog = [...state.backLog, action.payload];
		},
		pushToBackLog: (state, action: PayloadAction<Song[]>) => {
			state.backLog = [...state.backLog, ...action.payload];
		},
		removeFromBackLog: (state, action: PayloadAction<Song>) => {
			state.backLog = state.backLog?.filter(q => q.id != action.payload?.id);
		},
		addToBackLogNext: (state, action: PayloadAction<Song>) => {
			state.backLog = [action.payload, ...state.backLog];
		},

		setPlaylists: (state, action: PayloadAction<Array<any>>) => {
			state.playlists = action.payload;
		},
		setLockedPlayer: (state, action: PayloadAction<boolean>) => {
			state.lockedPlayer = action.payload;
		},
		setSortType: (state, action: PayloadAction<string>) => {
			state.sortType = action.payload;
		},
		setSortOrder: (state, action: PayloadAction<string>) => {
			state.sortOrder = action.payload;
		},
		setDisplayList: (state, action: PayloadAction<DisplayList | null>) => {
			state.displayList = action.payload;
		},
		setFilteredList: (state, action: PayloadAction<Song[]>) => {
			state.filteredList = action.payload;
		},
		setIsCurrentDevice: (state, action: PayloadAction<boolean>) => {
			state.isCurrentDevice = action.payload;
		},
		setCurrentImage: (state, action: PayloadAction<string>) => {
			state.currentImage = action.payload;
		},
	},
});

export default musicPlayer;
