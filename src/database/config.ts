import { configDb, queueDb } from '../state';
import { PrismaClient as configDbModel, PrismaClient as configPrismaClient } from './config/client';
import { PrismaClient as queueDbModel, PrismaClient as queuePrismaClient } from './queue/client';

import { convertPath } from '../functions/system';
import { execSync } from 'child_process';

export const configDatabaseString = `file:${configDb.replace(/\\/gu, '/')}?socket_timeout=99999&connection_limit=1&timeout=99999&busy_timeout=99999`;
export const queueDatabaseString = `file:${queueDb.replace(/\\/gu, '/')}?socket_timeout=99999&connection_limit=1&timeout=99999&busy_timeout=99999`;

let client: configPrismaClient;

process.env.DATABASE_URL = configDatabaseString;

try {
	client = new configDbModel({
		datasources: {
			db: {
				url: configDatabaseString,
			},
		},
		errorFormat: 'pretty',
		log: [
			{
				emit: 'stdout',
				level: 'error',
			},
		],
	});
} catch (error) {

	execSync(`yarn prisma migrate dev --name dev --schema ${convertPath(`${__dirname}/config/schema.prisma`)}`, {
		shell: 'powershell.exe',
	});

	execSync(`npx prisma generate --schema ${convertPath(`${__dirname}/config/schema.prisma`)}`, {
		shell: 'powershell.exe',
	});

	client = new configDbModel({
		datasources: {
			db: {
				url: configDatabaseString,
			},
		},
		errorFormat: 'pretty',
		log: [
			{
				emit: 'stdout',
				level: 'error',
			},
		],
	});
}

export const confDb: configPrismaClient = client;


let client2: queuePrismaClient;

try {
	client2 = new queueDbModel({
		datasources: {
			db: {
				url: queueDatabaseString,
			},
		},
	});
} catch (error) {

	execSync(`npx prisma migrate deploy --schema ${convertPath(`${__dirname}/queue/schema.prisma`)}`, {
		shell: 'powershell.exe',
	});

	execSync(`npx prisma generate --schema ${convertPath(`${__dirname}/queue/schema.prisma`)}`, {
		shell: 'powershell.exe',
	});

	client2 = new queueDbModel({
		datasources: {
			db: {
				url: queueDatabaseString,
			},
		},
	});
}

export const queDb: queuePrismaClient = client2;
