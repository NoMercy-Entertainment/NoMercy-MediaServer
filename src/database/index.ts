import { configDb, queueDb } from '../state';

import Logger from '../functions/logger';
import { Prisma } from '@prisma/client';
import { confDb } from './config';
import { convertPath } from '../functions/system';
import { execSync } from 'child_process';

export const configDatabaseString = `file:${configDb.replace(/\\/gu, '/')}?socket_timeout=10&connection_limit=1&timeout=5000`;
export const queueDatabaseString = `file:${queueDb.replace(/\\/gu, '/')}?socket_timeout=10&connection_limit=1&timeout=5000`;

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

export const commitConfigTransaction = async (transaction: Prisma.PromiseReturnType<any>[]) => {
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
