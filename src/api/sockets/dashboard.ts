import fs from 'fs';

import { deviceName } from '../../functions/system';
import {
  storeServerActivity,
} from '../../api/userData/activity/post';

// import progress from '../../controllers/encoder/ffmpeg/progress';
import i18next from 'i18next';
const watchDir = `${__dirname}/../../cache/working/`;

export default function (socket, io) {
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
		data.from = socket.request.connection.remoteAddress,
		data.device_name = socket.handshake.headers.device_name,
		data.device_type = socket.handshake.headers.device_type,
		data.device_os = socket.handshake.headers.device_os,
		data.version = '0.0.5',
		await storeServerActivity(data);
	});
	
}
