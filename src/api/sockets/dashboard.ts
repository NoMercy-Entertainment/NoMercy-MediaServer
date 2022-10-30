import { deviceName } from '../../functions/system';
// import progress from '../../controllers/encoder/ffmpeg/progress';
import fs from 'fs';
import i18next from 'i18next';
import path from 'path';

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
}
