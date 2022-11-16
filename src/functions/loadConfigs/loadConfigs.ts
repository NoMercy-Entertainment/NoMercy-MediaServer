import { setDeviceName, setLibraries } from '../../state/redux/config/actions';
import { setSecureExternalPort, setSecureInternalPort } from '../../state/redux/system/actions';

import { Configuration } from '@prisma/client'
import { confDb } from '../../database/config';
import { getLibrariesWithFolders } from '../../database/data';

export const loadConfigs = async () => {

	const dbConf: Configuration[] = await confDb.configuration.findMany();

	const secureInternalPort = (dbConf.find((conf) => conf.key == 'secureInternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureInternalPort(parseInt(secureInternalPort, 10));

	const secureExternalPort = (dbConf.find((conf) => conf.key == 'secureExternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureExternalPort(parseInt(secureExternalPort, 10));

	const deviceName = dbConf.find((conf) => conf.key == 'deviceName')?.value as string;
	setDeviceName(deviceName);
	
	const libraries = await getLibrariesWithFolders();
	setLibraries(libraries);
	
};

export default loadConfigs;