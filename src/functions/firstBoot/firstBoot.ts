import { migrateConfigDatabase, migrateQueueDatabase } from '../../database';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';

export default async () => {
	await createAppFolders();

	await migrateQueueDatabase();

	await migrateConfigDatabase();

	await registerServer();

	await downloadBinaries();
};
