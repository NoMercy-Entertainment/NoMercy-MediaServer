import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';
import { migrateConfigDatabase, migrateQueueDatabase } from '../../database';

export default async () => {
	await createAppFolders();

	// await migrateQueueDatabase();

	// await migrateConfigDatabase();

	await registerServer();

	await downloadBinaries();
};
