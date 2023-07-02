import type { Config } from 'drizzle-kit';

export default {
	schema: './src/db/queue/schema/*',
	out: './src/db/queue/migrations',
	breakpoints: true,
} satisfies Config;
