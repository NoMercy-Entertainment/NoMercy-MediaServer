import { existsSync, rmSync, writeFileSync } from 'fs';
import { get_external_ip, get_internal_ip, portMap } from '../networking';
import { setupComplete, transcodesPath } from '@server/state';

import baseConfiguration from '../../loaders/cdn/cdn';
import chromeCast from '../chromeCast';
import dev from './dev';
import firstBoot from '../firstBoot';
// import { getAuthKeys } from '../keycloak';
import logo from '../logo';
import queue from '../queue';
import seed from '@server/db/seed';
import { watcher } from '@server/tasks/files/watcher';
import certificate from '../certificate';
import loadConfigs from '../loadConfigs';
// import moderators from '../moderators';
import refreshToken from '../auth/refreshToken';
// import getUsers from '../users';
import server from '@server/loaders/server';
import queueDB from '@server/db/queue';
import mediaDb from '@server/db/media';
// import { getAuthKeys } from '@server/functions/keycloak';
import { moderators } from '@server/functions/moderators';
import { getUsers } from '@server/functions/users';
import { aquireToken } from '@server/functions/auth/login';

export default async () => {
	process
		.on('unhandledRejection', (reason, p) => {
			console.error(reason, 'Unhandled Rejection at Promise', p);
		})
		.on('uncaughtException', (err) => {
			console.error(err, 'Uncaught Exception thrown');
			// process.exit(1);
		});


	writeFileSync('query.log', '');
	if (existsSync(transcodesPath)) {
		rmSync(transcodesPath, { recursive: true });
	}

	await get_external_ip();
	get_internal_ip();

	await aquireToken();

	if (setupComplete) {
		mediaDb();
		queueDB();
	} else {
		await firstBoot();
	}

	// await getAuthKeys();

	await baseConfiguration();
	logo();

	loadConfigs();

	await refreshToken();

	await certificate();

	await moderators();

	await getUsers();

	await seed();

	loadConfigs();

	await portMap();

	await server();

	queue();

	chromeCast();

	dev();

	watcher();

};
