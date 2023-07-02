import migrate from '../../db/migrate';
import { migrateConfigDatabase, migrateQueueDatabase } from '../../database';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';

export default async () => {
	createAppFolders();

	migrate();

	await migrateConfigDatabase();

	await migrateQueueDatabase();

	await registerServer();

	await downloadBinaries();
};
