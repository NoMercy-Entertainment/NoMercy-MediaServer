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
	setVolumeState
} from '@/state/redux/music/actions';

import { emitData } from './helpers';
import { store } from '@/state/redux';

export interface SocketData {
	value: any;
	deviceId: string;
}

export default function (socket) {

	const toAll = socket.nsp.to(socket.decoded_token.sub);
	const toOther = socket.to(socket.decoded_token.sub);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const log = (key: string, value: any) => null;
	// const log = (key: string, value: any) => console.log(key, value);
	// const log = (key, value) => Logger.log({
	//     level: 'http',
	//     name: key,
	//     color: 'yellow',
	//     user: socket.decoded_token.name,
	//     message: value,
	// });
	// if (data.deviceId == store.getState().music.currentDevice) return;
	// console.log(JSON.stringify(store.getState().music.queue?.map(q => q.name), null, 2));

	socket.on('getState', () => {
		toAll.emit('setCurrentDevice', emitData(store.getState().music.currentDevice));
		toAll.emit('setState', emitData(store.getState().music.state));
		toAll.emit('setFadeDuration', emitData(store.getState().music.fadeDuration));
		toAll.emit('setQueue', emitData(store.getState().music.queue));
		toAll.emit('setBackLog', emitData(store.getState().music.backLog));
		toAll.emit('setCurrentItem', emitData(store.getState().music.currentItem));
		toAll.emit('setCurrentItemIndex', emitData(store.getState().music.currentItemIndex));
		toAll.emit('setPlayState', emitData(store.getState().music.playState));
		toAll.emit('setMutedState', emitData(store.getState().music.mutedState));
		toAll.emit('setVolumeState', emitData(store.getState().music.volumeState));
		setTimeout(() => {
			toAll.emit('setPositionState', emitData(store.getState().music.positionState));
			toAll.emit('setDurationState', emitData(store.getState().music.durationState));
			toAll.emit('setLyrics', emitData(store.getState().music.lyrics));
		}, 300);
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
		// toOther.emit('setHome', data);
		// log('setHome', data.value);
	});
	socket.on('setFadeDuration', (data: SocketData) => {
		setFadeDuration(data.value);
		// toOther.emit('setFadeDuration', data);
		// log('setFadeDuration', data.value);
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
	socket.on('setMobileVolume', (data: SocketData) => {
		setPositionState(data.value);
		toOther.emit('setMobileVolume', data);
		log('setMobileVolume', data.value);
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
