import { AppState, useSelector } from '@/state/redux';

import { deviceName } from '../../functions/system';
import fs from 'fs';
import i18next from 'i18next';
import { storeServerActivity } from '../../api/userData/activity/post';

const watchDir = `${__dirname}/../../cache/working/`;

export default function (socket) {
	socket.on('servers', () => {

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

	const handlePause = (id: any) => {
		const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
		queueWorker.forks.forEach((worker) => {
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
