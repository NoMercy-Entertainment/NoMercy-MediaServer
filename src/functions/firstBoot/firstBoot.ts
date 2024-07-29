import createAppFolders from '../createAppFolders';
import queueDb from '@server/db/queue';
import migrate from '@server/db/migrate';
import registerServer from '../registerServer';
import downloadBinaries from '../downloadBinaries';
import mediaDb from '@server/db/media';

export default async () => {
	createAppFolders();

	mediaDb();
	queueDb();

	migrate();

	await registerServer();

	await downloadBinaries();
};
