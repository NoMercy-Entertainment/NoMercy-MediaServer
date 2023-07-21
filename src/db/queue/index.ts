import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as failedJobs from './schema/failedJobs';
import * as queueJobs from './schema/queueJobs';
import { queueDbFile } from '@server/state';

const queueSchema = {
	...queueJobs,
	...failedJobs,
};

// export let queueDb: BetterSQLite3Database<typeof queueSchema>;

export default () => {
	globalThis.queueDb = drizzle(new Database(queueDbFile), {
		schema: queueSchema,
		// logger: new MyLogger(),
	});
}
