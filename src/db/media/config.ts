import { mediaDbFile } from '@server/state';
import type { Config } from 'drizzle-kit';

export default {
	driver: 'better-sqlite',
	schema: './src/db/media/schema/*',
	out: './src/db/media/migrations',
	breakpoints: true,
	dbCredentials: {
	  url: mediaDbFile,
	},
} satisfies Config;
