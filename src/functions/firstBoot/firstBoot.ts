import migrate from '@server/db/migrate';

import createAppFolders from '../createAppFolders';
import downloadBinaries from '../downloadBinaries';
import mediaDb from '@server/db/media';
import queueDb from '@server/db/queue';
import registerServer from '../registerServer';

export default async () => {
	createAppFolders();

	mediaDb();
	queueDb();

	migrate();

	await registerServer();

	await downloadBinaries();
};
