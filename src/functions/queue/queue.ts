import { AppState, useSelector } from '../../state/redux';

import { Configuration } from '@prisma/client';
import { confDb } from '../../database/config';

export default async () => {

	const dbConf: Configuration[] = await confDb.configuration.findMany();	

	const queueWorkers = dbConf.find((conf) => conf.key == 'queueWorkers')?.value as string;
	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.setWorkers(parseInt(queueWorkers ?? '1', 10));
	queueWorker.start();

	const cronWorkers = dbConf.find((conf) => conf.key == 'cronWorkers')?.value as string;
	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.setWorkers(parseInt(cronWorkers ?? '1', 10));
	cronWorker.start();
	
	const dataWorkers = dbConf.find((conf) => conf.key == 'dataWorkers')?.value as string;
	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.setWorkers(parseInt(dataWorkers ?? '1', 10));
	dataWorker.start();

	const requestWorkers = dbConf.find((conf) => conf.key == 'requestWorkers')?.value as string;
	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.setWorkers(parseInt(requestWorkers ?? '1', 10));
	requestWorker.start();

};
