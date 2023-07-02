import type { Config } from 'drizzle-kit';

export default {
	schema: './src/db/media/schema/*',
	out: './src/db/media/migrations',
	breakpoints: true,
} satisfies Config;
