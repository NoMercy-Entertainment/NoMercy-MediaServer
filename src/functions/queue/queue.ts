import { AppState, useSelector } from '@server/state/redux';

import { selectConfiguration } from '@server/db/media/actions/configuration';

export default () => {

	const dbConf = selectConfiguration();

	const queueWorkers = dbConf.find(conf => conf.key == 'queueWorkers')?.value as string;
	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.setWorkers(parseInt(queueWorkers ?? '1', 10)).start();

	const cronWorkers = dbConf.find(conf => conf.key == 'cronWorkers')?.value as string;
	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.setWorkers(parseInt(cronWorkers ?? '1', 10)).start();

	const dataWorkers = dbConf.find(conf => conf.key == 'dataWorkers')?.value as string;
	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.setWorkers(parseInt(dataWorkers ?? '1', 10)).start();

	const requestWorkers = dbConf.find(conf => conf.key == 'requestWorkers')?.value as string;
	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.setWorkers(parseInt(requestWorkers ?? '1', 10)).start();

	const encoderWorkers = dbConf.find(conf => conf.key == 'encoderWorkers')?.value as string;
	const encoderWorker = useSelector((state: AppState) => state.config.encoderWorker);
	encoderWorker.setWorkers(parseInt(encoderWorkers ?? '1', 10)).start();

};
