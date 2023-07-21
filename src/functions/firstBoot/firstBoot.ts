import migrate from '@server/db/migrate';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import registerServer from '../registerServer';
import mediaDb from '@server/db/media';
import queueDb from '@server/db/queue';

export default async () => {
	createAppFolders();

	mediaDb();
	queueDb();

	migrate();

	await registerServer();

	await downloadBinaries();
};
