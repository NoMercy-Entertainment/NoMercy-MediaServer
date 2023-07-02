import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as failedJobs from './schema/failedJobs';
import * as queueJobs from './schema/queueJobs';

const queue = new Database('queue.db', {
	timeout: 100000,
	// verbose: console.log,
});

// @ts-ignore
export const queueDb: BetterSQLite3Database = drizzle(queue, {
	schema: {
		...queueJobs,
		...failedJobs,
	},
	// logger: new MyLogger(),
});
