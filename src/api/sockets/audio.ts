import {
    addToBackLog,
    addToBackLogNext,
    addToQueue,
    addToQueueNext,
    pushToBackLog,
    pushToQueue,
    removeFromBackLog,
    removeFromQueue,
    setAlbums,
    setArtists,
    setBackLog,
    setCurrentDevice,
    setCurrentItem,
    setCurrentItemIndex,
    setDisplayList,
    setDurationState,
    setFadeDuration,
    setHome,
    setIsCurrentDevice,
    setLikedSongs,
    setLyrics,
    setMutedState,
    setPlayState,
    setPlaylists,
    setPositionState,
    setQueue,
    setShowLyrics,
    setState,
    setVolumeState,
} from '../../state/redux/music/actions';

import { store } from '../../state/redux';

export interface SocketData {
	value: any;
	deviceId: string;
}

export default function (socket, io) {

	const toAll = socket.nsp.to(socket.decoded_token.sub);
	const toOther = socket.to(socket.decoded_token.sub);
    const log = (key, value) => null;
    // const log = (key, value) => Logger.log({
    //     level: 'http',
    //     name: key,
    //     color: 'yellow',
    //     user: socket.decoded_token.name,
    //     message: value,
    // });
    // if (data.deviceId == store.getState().music.currentDevice) return;
    // console.log(JSON.stringify(store.getState().music.queue?.map(q => q.name), null, 2));
    
    socket.on('getState', (data) => {
        socket.emit('setCurrentDevice', store.getState().music.currentDevice);
        socket.emit('setState', store.getState().music.state);
        // socket.emit('setHome', store.getState().music.home);
        // socket.emit('setFadeDuration', store.getState().music.fadeDuration);
        socket.emit('setCurrentItemIndex', store.getState().music.currentItemIndex);
        socket.emit('setCurrentItem', store.getState().music.currentItem);
        // socket.emit('setIsCurrentDevice', store.getState().music.currentDevice);
        socket.emit('setPlayState', store.getState().music.playState);
        socket.emit('setMutedState', store.getState().music.mutedState);
        socket.emit('setVolumeState', store.getState().music.volumeState);
        socket.emit('setPositionState', store.getState().music.positionState);
        socket.emit('setDurationState', store.getState().music.durationState);
        // socket.emit('setLyrics', store.getState().music.lyrics);
        // socket.emit('setShowLyrics', store.getState().music.showLyrics);
        // socket.emit('setArtists', store.getState().music.artists);
        // socket.emit('setAlbums', store.getState().music.albums);
        // socket.emit('setLikedSongs', store.getState().music.likedSongs);
        // socket.emit('setPlaylists', store.getState().music.playlists);
        socket.emit('setQueue', store.getState().music.queue);
        socket.emit('setBackLog', store.getState().music.backLog);
        // socket.emit('addToBackLog', store.getState().music.currentDevice);
        socket.emit('setDisplayList', store.getState().music.displayList);
    });

	socket.on('setCurrentDevice', (data) => {
        setCurrentDevice(data.value);
		toAll.emit('setCurrentDevice', data);
		log('setCurrentDevice', data.value);
	});

	socket.on('setState', (data: SocketData) => {
		setState(data.value);
        toOther.emit('setState', data);
		log('setState', data.value);
	});
	socket.on('setHome', (data: SocketData) => {
		setHome(data.value);
        toOther.emit('setHome', data);
		log('setHome', data.value);
	});
	socket.on('setFadeDuration', (data: SocketData) => {
		setFadeDuration(data.value);
        toOther.emit('setFadeDuration', data);
		log('setFadeDuration', data.value);
	});
	socket.on('setCurrentItemIndex', (data: SocketData) => {
		setCurrentItemIndex(data.value);
        toOther.emit('setCurrentItemIndex', data);
		log('setCurrentItemIndex', data.value);
	});
	socket.on('setCurrentItem', (data: SocketData) => {
		setCurrentItem(data.value);
        toOther.emit('setCurrentItem', data);
		log('setCurrentItem', data.value);
	});
	socket.on('setIsCurrentDevice', (data: SocketData) => {
		setIsCurrentDevice(data.value);
        toOther.emit('setIsCurrentDevice', data);
		log('setIsCurrentDevice', data.value);
	});
	socket.on('setPlayState', (data: SocketData) => {
		setPlayState(data.value);
        toOther.emit('setPlayState', data);
		log('setPlayState', data.value);
	});
	socket.on('setMutedState', (data: SocketData) => {
		setMutedState(data.value);
        toOther.emit('setMutedState', data);
		log('setMutedState', data.value);
	});
	socket.on('setVolumeState', (data: SocketData) => {
		setVolumeState(data.value);
        toOther.emit('setVolumeState', data);
		log('setVolumeState', data.value);
	});
	socket.on('handlePositionChange', (data: SocketData) => {
		setPositionState(data.value);
        toOther.emit('handlePositionChange', data);
		log('handlePositionChange', data.value);
	});
	socket.on('setPositionState', (data: SocketData) => {
		setPositionState(data.value);
        toOther.emit('setPositionState', data);
		log('setPositionState', data.value);
	});
	socket.on('setDurationState', (data: SocketData) => {
		setDurationState(data.value);
        toOther.emit('setDurationState', data);
		log('setDurationState', data.value);
	});
	socket.on('setLyrics', (data: SocketData) => {
		setLyrics(data.value);
        toOther.emit('setLyrics', data);
		log('setLyrics', data.value);
	});
	socket.on('setShowLyrics', (data: SocketData) => {
		setShowLyrics(data.value);
        toOther.emit('setShowLyrics', data);
		log('setShowLyrics', data.value);
	});
	socket.on('setArtists', (data: SocketData) => {
		setArtists(data.value);
        toOther.emit('setArtists', data);
		log('setArtists', data.value);
	});
	socket.on('setAlbums', (data: SocketData) => {
		setAlbums(data.value);
        toOther.emit('setAlbums', data);
		log('setAlbums', data.value);
	});
	socket.on('setLikedSongs', (data: SocketData) => {
		setLikedSongs(data.value);
        toOther.emit('setLikedSongs', data);
		log('setLikedSongs', data.value);
	});
	socket.on('setPlaylists', (data: SocketData) => {
		setPlaylists(data.value);
        toOther.emit('setPlaylists', data);
		log('setPlaylists', data.value);
	});
	socket.on('setQueue', (data: SocketData) => {
		setQueue(data.value);
        toOther.emit('setQueue', data);
		log('setQueue', data.value);
	});
	socket.on('addToQueue', (data: SocketData) => {
		addToQueue(data.value);
        toOther.emit('addToQueue', data);
		log('addToQueue', data.value);
	});
	socket.on('pushToQueue', (data: SocketData) => {
		pushToQueue(data.value);
        toOther.emit('pushToQueue', data);
		log('pushToQueue', data.value);
	});
	socket.on('addToQueueNext', (data: SocketData) => {
		addToQueueNext(data.value);
        toOther.emit('addToQueueNext', data);
		log('addToQueueNext', data.value);
	});
	socket.on('removeFromQueue', (data: SocketData) => {
		removeFromQueue(data.value);
        toOther.emit('removeFromQueue', data);
		log('removeFromQueue', data.value);
	});
	socket.on('setBackLog', (data: SocketData) => {
		setBackLog(data.value);
        toOther.emit('setBackLog', data);
		log('setBackLog', data.value);
	});
	socket.on('addToBackLog', (data: SocketData) => {
		addToBackLog(data.value);
        toOther.emit('addToBackLog', data);
		log('addToBackLog', data.value);
	});
	socket.on('pushToBackLog', (data: SocketData) => {
		pushToBackLog(data.value);
        toOther.emit('pushToBackLog', data);
		log('pushToBackLog', data.value);
	});
	socket.on('removeFromBackLog', (data: SocketData) => {
		removeFromBackLog(data.value);
        toOther.emit('removeFromBackLog', data);
		log('removeFromBackLog', data.value);
	});
	socket.on('addToBackLogNext', (data: SocketData) => {
		addToBackLogNext(data.value);
        toOther.emit('addToBackLogNext', data);
		log('addToBackLogNext', data.value);
	});
	socket.on('setDisplayList', (data: SocketData) => {
		setDisplayList(data.value);
        toOther.emit('setDisplayList', data);
		log('setDisplayList', data.value);
	});

}



// socket.on('playback', (data) => {
//     setPlayState(PlayState[data.value]);
// 	// toAll.emit('playback', data);
// 	toOther.emit('playback', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'playback',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('volume', (data) => {
//     setVolumeState(data.value);
// 	// toAll.emit('volume', data);
// 	toOther.emit('volume', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'volume',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });
// socket.on('position', (data) => {
//     setPositionState(data.value);
// 	// toAll.emit('position', data);
// 	toOther.emit('position', data);
// });

// socket.on('setDurationState', (data) => {
//     setDurationState(data.value);
// 	// toAll.emit('duration', data);
// 	toOther.emit('setDurationState', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'setDurationState',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('setCurrentItem', (data) => {
//     setCurrentItem(data.value);
// 	// toAll.emit('setCurrentItem', data);
// 	toOther.emit('setCurrentItem', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'setCurrentItem',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('setQueue', (data) => {
//     if(!data.value) return;
//     setQueue(data.value);
// 	// toAll.emit('setQueue', data);
// 	toOther.emit('setQueue', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'setQueue',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('addToQueueNext', (data) => {
//     addToQueueNext(data.value);
// 	// toAll.emit('addToQueueNext', data);
// 	toOther.emit('addToQueueNext', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'addToQueueNext',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('addToQueue', (data) => {
//     addToQueue(data.value);
// 	// toAll.emit('addToQueue', data);
// 	toOther.emit('addToQueue', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'addToQueue',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('removeFromQueue', (data) => {
//     removeFromQueue(data.value);
// 	// toAll.emit('removeFromQueue', data);
// 	toOther.emit('removeFromQueue', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'removeFromQueue',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('setBackLog', (data) => {
//     setBackLog(data.value);
// 	// toAll.emit('setBackLog', data);
// 	toOther.emit('setBackLog', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'setBackLog',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('removeFromQueue', (data) => {
//     removeFromQueue(data.value);
// 	// toAll.emit('removeFromQueue', data);
// 	toOther.emit('removeFromQueue', data);
// 	Logger.log({
// 		level: 'http',
// 		name: 'removeFromQueue',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
// });

// socket.on('addToQueue', (data) => {
// 	Logger.log({
// 		level: 'http',
// 		name: 'addToQueue',
// 		color: 'yellow',
// 		user: socket.decoded_token.name,
// 		message: data.value,
// 	});
//  toAll.emit('addToQueue', data);
// 	toOther.emit('addToQueue', data);
// });
    