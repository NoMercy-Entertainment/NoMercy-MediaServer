import { AppState, useSelector } from '@server/state/redux';
import SocketIO from 'socket.io';

export default function(socket: SocketIO.Socket & { decoded_token: { sub: string, name: string } }) {

	const chromeCast = useSelector((state: AppState) => state.config.chromeCast);

	socket.on('cast_load', (d: { file: string; path?: string | undefined; }) => chromeCast.load(d));
	socket.on('cast_time', chromeCast.currentTime);

	socket.on('cast_clients', () => {
		socket.emit('cast_clients', chromeCast.devices.map(c => c.friendlyName));
	});
	socket.on('cast_devices', () => {
		socket.emit('cast_devices', chromeCast.devices.map(c => ({
			host: c.host,
			name: c.name,
			friendlyName: c.friendlyName,
		})));
	});

	if (typeof chromeCast.currentDevice.on == 'function') {
		chromeCast.currentDevice?.on('connected', () => {
			socket.emit('cast_connected', chromeCast.currentDevice.friendlyName);
		});
		chromeCast.currentDevice.on('status', (status) => {
			socket.emit('cast_status', status);
		});
	}

	socket.on('cast_status_start', () => chromeCast.startLoop());

	socket.on('cast_status_stop', () => chromeCast.stopLoop());

	socket.on('cast_resume', () => {
		chromeCast.currentDevice.resume(e => socket.emit('cast_error', e));
	});
	socket.on('cast_pause', () => {
		chromeCast.currentDevice.pause(e => socket.emit('cast_error', e));
	});
	socket.on('cast_stop', () => {
		try {
			chromeCast.currentDevice.stop(e => socket.emit('cast_error', e));

			// chromeCast.spawn.kill('SIGKILL');
			// while (existsSync(`${transcodesPath}/${chromeCast.currentDevice.friendlyName}`)) {
			// 	rmSync(`${transcodesPath}/${chromeCast.currentDevice.friendlyName}`, { recursive: true });
			// }
		} catch (error) {
			//
		}
	});
	socket.on('cast_seek', (d: number) => {
		chromeCast.currentDevice.seek(d);
	});
	socket.on('cast_seekTo', (d: number) => {
		chromeCast.currentDevice.seekTo(d);
	});
	socket.on('cast_changeSubtitles', (d: number) => {
		chromeCast.currentDevice.changeSubtitles(d, e => socket.emit('cast_error', e));
	});
	socket.on('cast_subtitlesOff', () => {
		chromeCast.currentDevice.subtitlesOff();
	});
	socket.on('cast_getCurrentTime', () => {
		chromeCast.currentDevice.getCurrentTime(t => socket.emit('cast_current_time', t));
	});
	socket.on('cast_close', () => {
		chromeCast.currentDevice.close();
	});

};
