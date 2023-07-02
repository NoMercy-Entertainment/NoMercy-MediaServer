import { setDeviceName, setLanguage, setLibraries } from '@/state/redux/config/actions';
import { setSecureExternalPort, setSecureInternalPort } from '@/state/redux/system/actions';

import { getLibrariesWithFolders } from '../../database/data';
import { deviceName } from '../system';
import { selectConfiguration } from '@/db/media/actions/configuration';

export const loadConfigs = async () => {

	const dbConf = selectConfiguration();

	const secureInternalPort = (dbConf.find(conf => conf.key == 'secureInternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureInternalPort(parseInt(secureInternalPort, 10));

	const secureExternalPort = (dbConf.find(conf => conf.key == 'secureExternalPort')?.value as string) ?? process.env.DEFAULT_PORT;
	setSecureExternalPort(parseInt(secureExternalPort, 10));

	const name = dbConf.find(conf => conf.key == 'deviceName')?.value as string;
	setDeviceName(name ?? deviceName);

	const language = dbConf.find(conf => conf.key == 'language')?.value as string;
	setLanguage(language);

	const libraries = await getLibrariesWithFolders();
	setLibraries(libraries);

};

export default loadConfigs;
