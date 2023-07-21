
import { emitData } from './helpers';
import { store } from '@server/state/redux';

export interface SocketData {
	value: any;
	deviceId: string;
}

export default function (socket) {

	const toAll = socket.nsp.to(socket.decoded_token.sub);
	const toOther = socket.to(socket.decoded_token.sub);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const log = (key: string, value: any) => null;
	const log = (key: string, value: any) => console.log(key, value);
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
		toAll.emit('setCurrentSong', emitData(store.getState().music.currentSong));
		toAll.emit('setPlayState', emitData(store.getState().music.playState));
		toAll.emit('setMutedState', emitData(store.getState().music.mutedState));
		toAll.emit('setVolume', emitData(store.getState().music.volume));
		setTimeout(() => {
			toAll.emit('setCurrentTime', emitData(store.getState().music.currentTime));
			toAll.emit('setDuration', emitData(store.getState().music.duration));
			toAll.emit('setLyrics', emitData(store.getState().music.lyrics));
		}, 300);
	});

	socket.on('setCurrentDevice', (data: SocketData) => {
		// setCurrentDevice(data.value);
		toOther.emit('setCurrentDevice', data.value);
		// log('setCurrentDevice', data.value);
	});
	socket.on('setCurrentSong', (data: SocketData) => {
		// setCurrentSong(data.value);
		toOther.emit('setCurrentSong', data.value);
		// log('setCurrentSong', data.value);
	});
	socket.on('setState', (data: SocketData) => {
		// setState(data.value);
		toOther.emit('setState', data.value);
		// log('setState', data.value);
	});
	socket.on('setsrc', (data: SocketData) => {
		// setsrc(data.value);
		toOther.emit('setsrc', data.value);
		// log('setsrc', data.value);
	});
	socket.on('setVolume', (data: SocketData) => {
		// setVolume(data.value);
		toOther.emit('setVolume', data.value);
		// log('setVolume', data.value);
	});
	socket.on('setMutedState', (data: SocketData) => {
		// setMutedState(data.value);
		toOther.emit('setMutedState', data.value);
		// log('setMutedState', data.value);
	});
	socket.on('setPlayState', (data: SocketData) => {
		// setPlayState(data.value);
		toOther.emit('setPlayState', data.value);
		// log('setPlayState', data.value);
	});
	socket.on('setDuration', (data: SocketData) => {
		// setDuration(data.value);
		toOther.emit('setDuration', data.value);
		// log('setDuration', data.value);
	});
	socket.on('setCurrentTime', (data: SocketData) => {
		// setCurrentTime(data.value);
		toOther.emit('setCurrentTime', data.value);
		// log('setCurrentTime', data.value);
	});
	socket.on('setPlaybackRate', (data: SocketData) => {
		// setPlaybackRate(data.value);
		toOther.emit('setPlaybackRate', data.value);
		// log('setPlaybackRate', data.value);
	});
	socket.on('setCurrentPlaylist', (data: SocketData) => {
		// setCurrentPlaylist(data.value);
		toOther.emit('setCurrentPlaylist', data.value);
		// log('setCurrentPlaylist', data.value);
	});
	socket.on('setCurrentSong', (data: SocketData) => {
		// setCurrentSong(data.value);
		toOther.emit('setCurrentSong', data.value);
		// log('setCurrentSong', data.value);
	});
	socket.on('setIsPlaying', (data: SocketData) => {
		// setIsPlaying(data.value);
		toOther.emit('setIsPlaying', data.value);
		// log('setIsPlaying', data.value);
	});
	socket.on('setIsPaused', (data: SocketData) => {
		// setIsPaused(data.value);
		toOther.emit('setIsPaused', data.value);
		// log('setIsPaused', data.value);
	});
	socket.on('setIsStopped', (data: SocketData) => {
		// setIsStopped(data.value);
		toOther.emit('setIsStopped', data.value);
		// log('setIsStopped', data.value);
	});
	socket.on('setIsMuted', (data: SocketData) => {
		// setIsMuted(data.value);
		toOther.emit('setIsMuted', data.value);
		// log('setIsMuted', data.value);
	});
	socket.on('setIsRepeating', (data: SocketData) => {
		// setIsRepeating(data.value);
		toOther.emit('setIsRepeating', data.value);
		// log('setIsRepeating', data.value);
	});
	socket.on('setIsShuffling', (data: SocketData) => {
		// setIsShuffling(data.value);
		toOther.emit('setIsShuffling', data.value);
		// log('setIsShuffling', data.value);
	});
	socket.on('setCurrentIndex', (data: SocketData) => {
		// setCurrentIndex(data.value);
		toOther.emit('setCurrentIndex', data.value);
		// log('setCurrentIndex', data.value);
	});
	socket.on('setFadeDuration', (data: SocketData) => {
		// setFadeDuration(data.value);
		toOther.emit('setFadeDuration', data.value);
		// log('setFadeDuration', data.value);
	});
	socket.on('setLyrics', (data: SocketData) => {
		// setLyrics(data.value);
		toOther.emit('setLyrics', data.value);
		// log('setLyrics', data.value);
	});
	socket.on('setQueue', (data: SocketData) => {
		// setQueue(data.value);
		toOther.emit('setQueue', data.value);
		// log('setQueue', data.value);
	});
	socket.on('addToQueue', (data: SocketData) => {
		// addToQueue(data.value);
		toOther.emit('addToQueue', data.value);
		log('addToQueue', data.value);
	});
	socket.on('pushToQueue', (data: SocketData) => {
		// pushToQueue(data.value);
		toOther.emit('pushToQueue', data.value);
		log('pushToQueue', data.value);
	});
	socket.on('removeFromQueue', (data: SocketData) => {
		// removeFromQueue(data.value);
		toOther.emit('removeFromQueue', data.value);
		log('removeFromQueue', data.value);
	});
	socket.on('addToQueueNext', (data: SocketData) => {
		// addToQueueNext(data.value);
		toOther.emit('addToQueueNext', data.value);
		log('addToQueueNext', data.value);
	});
	socket.on('setBackLog', (data: SocketData) => {
		// setBackLog(data.value);
		toOther.emit('setBackLog', data.value);
		// log('setBackLog', data.value);
	});
	socket.on('addToBackLog', (data: SocketData) => {
		// addToBackLog(data.value);
		toOther.emit('addToBackLog', data.value);
		log('addToBackLog', data.value);
	});
	socket.on('pushToBackLog', (data: SocketData) => {
		// pushToBackLog(data.value);
		toOther.emit('pushToBackLog', data.value);
		log('pushToBackLog', data.value);
	});
	socket.on('removeFromBackLog', (data: SocketData) => {
		// removeFromBackLog(data.value);
		toOther.emit('removeFromBackLog', data.value);
		log('removeFromBackLog', data.value);
	});
	socket.on('addToBackLogNext', (data: SocketData) => {
		// addToBackLogNext(data.value);
		toOther.emit('addToBackLogNext', data.value);
		log('addToBackLogNext', data.value);
	});
	socket.on('setPlaylists', (data: SocketData) => {
		// setPlaylists(data.value);
		toOther.emit('setPlaylists', data.value);
		// log('setPlaylists', data.value);
	});
	socket.on('setFilteredList', (data: SocketData) => {
		// setFilteredList(data.value);
		toOther.emit('setFilteredList', data.value);
		// log('setFilteredList', data.value);
	});
	socket.on('setDisplayList', (data: SocketData) => {
		// setDisplayList(data.value);
		toOther.emit('setDisplayList', data.value);
		// log('setDisplayList', data.value);
	});
}
