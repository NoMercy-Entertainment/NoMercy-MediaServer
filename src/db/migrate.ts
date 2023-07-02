import { execSync } from 'child_process';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mediaDb } from './media';
import { queueDb } from './queue';

export default () => {

	execSync('npx drizzle-kit generate:sqlite --config=src/db/media/config.ts');
	migrate(mediaDb, { migrationsFolder: 'src/db/media/migrations' });

	execSync('npx drizzle-kit generate:sqlite --config=src/db/queue/config.ts');
	migrate(queueDb, { migrationsFolder: 'src/db/queue/migrations' });
};
