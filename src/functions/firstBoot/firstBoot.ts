import migrate from '@server/db/migrate';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';

export default async () => {
	createAppFolders();

	migrate();

	await registerServer();

	await downloadBinaries();
};
