import { AppState, useSelector } from '../../state/redux';

// import { resolve } from "path";
import { Configuration } from '@prisma/client';
import { confDb } from '../../database/config';

export default async () => {

	const dbConf: Configuration[] = await confDb.configuration.findMany();

	const queueWorkers = dbConf.find((conf) => conf.key == 'queueWorkers')?.value as string;
	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.setWorkers(parseInt(queueWorkers, 10));
	queueWorker.start();

	const cronWorkers = dbConf.find((conf) => conf.key == 'cronWorkers')?.value as string;
	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.setWorkers(parseInt(cronWorkers, 10));
	cronWorker.start();
	
	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.start();

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.start();

	// for (let i = 0; i < 1000; i++) {
	//     queue.add({
	//         file: resolve(__dirname, '..', 'jobs'),
	//         fn: 'sum',
	//         args: { a: i, b: i },
	//     });
	// }
};
