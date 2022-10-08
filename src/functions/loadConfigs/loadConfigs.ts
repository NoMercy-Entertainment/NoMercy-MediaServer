import { AppState, useSelector } from '../../state/redux';
import { confDb } from '../../database/config';
import { Configuration } from '@prisma/client'
import { setDeviceName, setLibraries } from '../../state/redux/config/actions';
import { setSecureExternalPort, setSecureInternalPort } from '../../state/redux/system/actions';
import { getLibrariesWithFolders } from '../../database/data';

export default async () => {

	const dbConf: Configuration[] = await confDb.configuration.findMany();

	const secureInternalPort = (dbConf.find((conf) => conf.key == 'secureInternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureInternalPort(parseInt(secureInternalPort, 10));

	const secureExternalPort = (dbConf.find((conf) => conf.key == 'secureExternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureExternalPort(parseInt(secureExternalPort, 10));

	const deviceName = dbConf.find((conf) => conf.key == 'deviceName')?.value as string;
	setDeviceName(deviceName);

	const queueWorkers = dbConf.find((conf) => conf.key == 'queueWorkers')?.value as string;
	const queueWorker = useSelector((state: AppState) => state.config.queueWorker);
	queueWorker.setWorkers(parseInt(queueWorkers, 10));

	const cronWorkers = dbConf.find((conf) => conf.key == 'cronWorkers')?.value as string;
	const cronWorker = useSelector((state: AppState) => state.config.cronWorker);
	cronWorker.setWorkers(parseInt(cronWorkers, 10));
	
	const dataWorker = useSelector((state: AppState) => state.config.dataWorker);
	dataWorker.start();

	const requestWorker = useSelector((state: AppState) => state.config.requestWorker);
	requestWorker.start();
	
	const libraries = await getLibrariesWithFolders();
	setLibraries(libraries);
	
};
