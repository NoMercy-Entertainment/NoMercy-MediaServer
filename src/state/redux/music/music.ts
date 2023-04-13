import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DisplayList, MutedState, PlayState, Song, State } from '../../../types/music';

const initialState = {
	albums: [],
	artists: [],
	audio: null as unknown as HTMLAudioElement,
	backLog: new Array<Song>(),
	currentItem: <Song>{},
	currentItemIndex: 0,
	displayList: <DisplayList>{},
	durationState: 0,
	fadeDuration: 3,
	home: null,
	isCurrentDevice: false,
	likedSongs: [],
	lyrics: null,
	mutedState: MutedState.unmuted,
	playlists: [],
	playState: PlayState.paused,
	positionState: 0,
	queue: new Array<Song>(),
	showLyrics: false,
	state: State.idle as State,
	volumeState: 1,
	currentDevice: '',
	shuffle: false,
	repeat: false,
	crossfadeSteps: 0,
	filteredList: new Array<Song>(),
	sortType: 'index',
	sortOrder: 'asc',
};

const music = createSlice({
	name: 'music',
	initialState: initialState,
	reducers: {
		setState: (state, action: PayloadAction<State>) => {
			state.state = action.payload;
		},
		setFadeDuration: (state, action: PayloadAction<number>) => {
			state.fadeDuration = action.payload;
		},
		setCurrentItemIndex: (state, action: PayloadAction<number>) => {
			state.currentItemIndex = action.payload;
		},
		setIsCurrentDevice: (state, action: PayloadAction<boolean>) => {
			state.isCurrentDevice = action.payload;
		},
		setPlayState: (state, action: PayloadAction<PlayState>) => {
			state.playState = action.payload;
		},
		setMutedState: (state, action: PayloadAction<MutedState>) => {
			state.mutedState = action.payload;
		},
		setVolumeState: (state, action: PayloadAction<number>) => {
			state.volumeState = action.payload;
		},
		setPositionState: (state, action: PayloadAction<number>) => {
			state.positionState = action.payload;
		},
		setDurationState: (state, action: PayloadAction<number>) => {
			state.durationState = action.payload;
		},
		setShowLyrics: (state, action: PayloadAction<boolean>) => {
			state.showLyrics = action.payload;
		},
		setQueue: (state, action: PayloadAction<Song[]>) => {
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
				state.backLog = [...(state.backLog ?? []), state.currentItem];
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
		setDisplayList: (state, action: PayloadAction<DisplayList>) => {
			state.displayList = action.payload;
		},
		setCurrentItem: (state, action: PayloadAction<Song>) => {
			state.currentItem = action.payload;
			state.queue = state.queue?.filter(q => q?.id != action.payload?.id);
		},
		setAudioElement: (state, action: PayloadAction<any>) => {
			state.audio = action.payload;
		},
		setShuffle: (state, action: PayloadAction<boolean>) => {
			state.shuffle = action.payload;
		},
		setRepeat: (state, action: PayloadAction<boolean>) => {
			state.repeat = action.payload;
		},
		setCurrentDevice: (state, action: PayloadAction<string>) => {
			state.currentDevice = action.payload;
		},
		setHome: (state, action: PayloadAction<any>) => {
			state.home = action.payload;
		},
		setLyrics: (state, action: PayloadAction<string>) => {
			// @ts-expect-error
			state.lyrics = action.payload;
		},
		setArtists: (state, action: PayloadAction<any[]>) => {
			// @ts-expect-error
			state.artists = action.payload;
		},
		setAlbums: (state, action: PayloadAction<any[]>) => {
			// @ts-expect-error
			state.albums = action.payload;
		},
		setLikedSongs: (state, action: PayloadAction<any[]>) => {
			// @ts-expect-error
			state.likedSongs = action.payload;
		},
		setPlaylists: (state, action: PayloadAction<any[]>) => {
			// @ts-expect-error
			state.playlists = action.payload;
		},
	},
});

export default music;
