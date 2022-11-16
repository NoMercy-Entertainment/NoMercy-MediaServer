import { configDatabaseString, queueDatabaseString } from './config';

import Logger from '../functions/logger';
import { convertPath } from '../functions/system';
import { execSync } from 'child_process';

export const migrateConfigDatabase = async() => {
	// if (!existsSync(configDb)) {
	process.env.DATABASE_URL = convertPath(configDatabaseString);

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Migrating config database',
	});

	execSync(`npx prisma migrate dev --name init --schema ${convertPath(__dirname + '/../prisma/schema.prisma')}`);
	execSync(`npx prisma generate --schema ${convertPath(__dirname + '/../prisma/schema.prisma')}`);

	const { confDb } = require('./config');
	await confDb.$queryRaw`PRAGMA journal_mode=WAL;`;
	// }
};

export const migrateQueueDatabase = async () => {
	// if (!existsSync(configDb)) {
	process.env.DATABASE_URL = convertPath(queueDatabaseString);

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Migrating queue database',
	});

	execSync(`npx prisma migrate dev --name init --schema ${convertPath(__dirname + '/queue/schema.prisma')}`);
	execSync(`npx prisma generate --schema ${convertPath(__dirname + '/queue/schema.prisma')}`);

	const { queDb } = require('./config');
	await queDb.$queryRaw`PRAGMA journal_mode=WAL;`;
	// }
};

export const commitConfigTransaction = async (transaction) => {
	const { confDb } = require('./config');
	try {
		await confDb.$transaction(transaction)
	} catch (error) {
		try {
			await confDb.$transaction(transaction);
		} catch (error) {
			// try {
				await confDb.$transaction(transaction);
			// } catch (error) {
			// 	Logger.log({
			// 		level: 'error',
			// 		name: 'database',
			// 		color: 'redBright',
			// 		message: `Error commiting data to the configuration database, please try again. ${error}`,
			// 	});
			// }
		}
	}
};
