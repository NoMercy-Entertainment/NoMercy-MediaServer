import { configDb, queueDb } from '../state';

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { PrismaClient as queueDbModel } from './queue/client';

export const configDatabaseString = `file:${configDb.replace(/\\/gu, '/')}?socket_timeout=99999&connection_limit=1&timeout=99999&busy_timeout=99999`;
export const queueDatabaseString = `file:${queueDb.replace(/\\/gu, '/')}?socket_timeout=99999&connection_limit=1&timeout=99999&busy_timeout=99999`;

let client: PrismaClient;

try {
	client = new PrismaClient({
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
	execSync('yarn prisma migrate dev --name dev --schema src/prisma/schema.prisma');

	client = new PrismaClient({
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

export const confDb: PrismaClient = client;

export const queDb: queueDbModel = new queueDbModel({
	datasources: {
		db: {
			url: queueDatabaseString,
		},
	},
});
