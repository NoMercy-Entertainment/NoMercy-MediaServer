import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as failedJobs from './schema/failedJobs';
import * as queueJobs from './schema/queueJobs';
import { queueDbFile } from '@server/state';

const queueSchema = {
	...queueJobs,
	...failedJobs,
};

const queue = new Database(queueDbFile, {
	timeout: 100000,
	// verbose: console.log,
});

export const queueDb: BetterSQLite3Database<typeof queueSchema> = drizzle(queue, {
	schema: queueSchema,
	// logger: new MyLogger(),
});
