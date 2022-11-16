import { migrateConfigDatabase, migrateQueueDatabase } from '../../database';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';

export default async () => {
	await createAppFolders();

	await migrateConfigDatabase();
	
	await migrateQueueDatabase();

	await registerServer();

	await downloadBinaries();
};
