import { queueDbFile } from '@server/state';
import type { Config } from 'drizzle-kit';

export default {
	driver: 'better-sqlite',
	schema: './src/db/queue/schema/*',
	out: './src/db/queue/migrations',
	dbCredentials: {
	  url: queueDbFile,
	},
	breakpoints: true,
} satisfies Config;
