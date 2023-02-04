import { AppState, useSelector } from '../../state/redux';

import { deviceName } from '../../functions/system';
import fs from 'fs';
import i18next from 'i18next';
import {
	storeServerActivity
} from '../../api/userData/activity/post';

// import progress from '../../controllers/encoder/ffmpeg/progress';

const watchDir = `${__dirname}/../../cache/working/`;

export default function (socket) {
	socket.on('servers', () => {
		// progress(socket, io);

		fs.writeFileSync(`${watchDir}update.json`, JSON.stringify(Date.now()));

		const workerName = deviceName;
		const status = i18next.t('inactive');
		socket.emit('servers', {
			workerName,
			status,
		});
	});

	socket.on('addActivityLog', async (data) => {
		data.sub_id = socket.decoded_token.sub;
		data.time = new Date();
		data.device_id = socket.handshake.headers.device_id;
		data.from = socket.request.connection.remoteAddress;
		data.device_name = socket.handshake.headers.device_name;
		data.device_type = socket.handshake.headers.device_type;
		data.device_os = socket.handshake.headers.device_os;
		data.version = '0.0.5';
		await storeServerActivity(data);
	});

	const cast = useSelector((state: AppState) => state.system.cast);

	socket.on('cast_clients', () => {
		socket.emit('cast_clients', cast.map(c => c.friendlyName));
	});

	if (typeof cast?.[0]?.on == 'function') {
		cast[0].on('status', (status) => {
			socket.emit('cast_status', status);
		});
	}

	socket.on('cast_resume', () => {
		cast[0].resume(e => socket.emit('cast_error', e));
	});
	socket.on('cast_pause', () => {
		cast[0].pause(e => socket.emit('cast_error', e));
	});
	socket.on('cast_stop', () => {
		cast[0].stop(e => socket.emit('cast_error', e));
	});
	socket.on('cast_seek', (d: number) => {
		cast[0].seek(d);
	});
	socket.on('cast_seekTo', (d: number) => {
		cast[0].seekTo(d);
	});
	socket.on('cast_changeSubtitles', (d: number) => {
		cast[0].changeSubtitles(d, e => socket.emit('cast_error', e));
	});
	socket.on('cast_subtitlesOff', () => {
		cast[0].subtitlesOff();
	});
	socket.on('cast_getCurrentTime', () => {
		cast[0].getCurrentTime(t => socket.emit('cast_current_time', t));
	});
	socket.on('cast_close', () => {
		cast[0].close();
	});

	cast[0].on('connected', () => {
		socket.emit('cast_connected', cast[0].friendlyName);
	});

}
