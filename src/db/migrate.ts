import { execSync } from 'child_process';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mediaDb } from './media';
import { queueDb } from './queue';
import { sql } from 'drizzle-orm';

export default () => {

	// console.log(`npx drizzle-kit generate:sqlite --config=src/db/media/config.ts`);
	execSync('npx drizzle-kit generate:sqlite --config=src/db/media/config.ts');
	migrate(mediaDb, { migrationsFolder: 'src/db/media/migrations' });
	// sql.raw(`PRAGMA journal_mode=WAL;`);

	// console.log(`npx drizzle-kit generate:sqlite --config=src/db/queue/config.ts`);
	execSync('npx drizzle-kit generate:sqlite --config=src/db/queue/config.ts');
	migrate(queueDb, { migrationsFolder: 'src/db/queue/migrations' });
};
