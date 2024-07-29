import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as failedJobs from './schema/failedJobs';
import * as queueJobs from './schema/queueJobs';
import { queueDbFile } from '@server/state';

export const queueDbSchema = {
	...queueJobs,
	...failedJobs,
};

export default () => {
	globalThis.queueDb = drizzle(new Database(queueDbFile), {
		schema: queueDbSchema,
		// logger: new MyLogger(),
	});
	return globalThis.queueDb;
};
