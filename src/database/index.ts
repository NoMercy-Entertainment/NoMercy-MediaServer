/* eslint-disable @typescript-eslint/no-var-requires */
import { configDatabaseString, queueDatabaseString } from './config';
import { configDb, queueDb } from '@/state';

import Logger from '../functions/logger';
import { convertPath } from '../functions/system';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export const migrateConfigDatabase = async() => {
	if (!existsSync(configDb)) {
		process.env.DATABASE_URL = convertPath(configDatabaseString);

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Migrating config database',
		});

		process.env.DATABASE_URL = configDatabaseString;

		try {
			execSync(`npx prisma migrate dev --name init --schema ${convertPath(`${__dirname}/config/schema.prisma`)}`, {
				shell: 'powershell.exe',
			});
		} catch (error) {
			execSync(`npx prisma migrate deploy --schema ${convertPath(`${__dirname}/config/schema.prisma`)}`, {
				shell: 'powershell.exe',
			});
		}
		execSync(`npx prisma generate --schema ${convertPath(`${__dirname}/config/schema.prisma`)}`, {
			shell: 'powershell.exe',
		});

		const { confDb } = require('./config');
		await confDb.$queryRaw`PRAGMA journal_mode=WAL;`;
		await confDb.$queryRaw`PRAGMA auto_vacuum = FULL;`;
	}
};

export const migrateQueueDatabase = async () => {
	if (!existsSync(queueDb)) {
		process.env.DATABASE_URL = convertPath(queueDatabaseString);

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Migrating queue database',
		});

		try {
			execSync(`npx prisma migrate dev --name init --schema ${convertPath(`${__dirname}/queue/schema.prisma`)}`, {
				shell: 'powershell.exe',
			});
		} catch (error) {
			execSync(`npx prisma migrate deploy --schema ${convertPath(`${__dirname}/queue/schema.prisma`)}`, {
				shell: 'powershell.exe',
			});
		}
		execSync(`npx prisma generate --schema ${convertPath(`${__dirname}/queue/schema.prisma`)}`, {
			shell: 'powershell.exe',
		});

		const { queDb } = require('./config');
		await queDb.$queryRaw`PRAGMA journal_mode=WAL;`;
		await queDb.$queryRaw`PRAGMA auto_vacuum = FULL;`;
	}
};

export const commitConfigTransaction = async (transaction) => {
	const { confDb } = require('./config');
	try {
		await confDb.$transaction(transaction);
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

export const checkDbLock = async () => {
	const { confDb } = require('./config');
	try {
		await confDb.$queryRaw`BEGIN EXCLUSIVE;`;
		await confDb.$queryRaw`COMMIT;`;
		return false;
	} catch (error) {
		return true;
	}
};
