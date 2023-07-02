import { AppState, useSelector } from '@/state/redux';

import fs from 'fs';
import i18next from 'i18next';
import { storeServerActivity } from '../../api/userData/activity/post';

const watchDir = `${__dirname}/../../cache/working/`;

export default function (socket) {
	socket.on('servers', () => {
		const deviceName = useSelector((state: AppState) => state.config.deviceName);

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
		data.from = socket.request.connection.remoteAddress;

		data.id = socket.handshake.headers.id;
		data.browser = socket.handshake.headers.browser;
		data.os = socket.handshake.headers.os;
		data.device = socket.handshake.headers.device;
		data.type = socket.handshake.headers.type;
		data.name = socket.handshake.headers.name;
		data.version = socket.handshake.headers.version;
		await storeServerActivity(data);
	});

	const handlePause = (id: any) => {
		const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
		queueWorker.sendMessage({ type: 'encoder-pause', id });
		queueWorker.forks.forEach((worker) => {
			console.log('socket', { type: 'encoder-pause', id });
			worker.worker.send({ type: 'encoder-pause', id });
		});
	};

	const handleResume = (id: any) => {
		const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
		queueWorker.forks.forEach((worker) => {
			worker.worker.send({ type: 'encoder-resume', id });
		});
	};

	socket.on('encoder-pause', handlePause);
	socket.on('encoder-resume', handleResume);


}
