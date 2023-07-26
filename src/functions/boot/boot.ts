import { existsSync, rmSync, writeFileSync } from 'fs';
import { get_external_ip, get_internal_ip, portMap } from '../networking';
import { setupComplete, transcodesPath } from '@server/state';

import baseConfiguration from '../../loaders/cdn/cdn';
import chromeCast from '../chromeCast';
import dev from './dev';
import firstBoot from '../firstBoot';
import { getKeycloakKeys } from '../keycloak';
import logo from '../logo';
import queue from '../queue';
import seed from '@server/db/seed';
import { watcher } from '@server/tasks/files/watcher';
import certificate from '../certificate';
import loadConfigs from '../loadConfigs';
import moderators from '../moderators';
import refreshToken from '../refreshToken';
import getUsers from '../users';
import server from '@server/loaders/server';
import mediaDB from '@server/db/media';
import queueDB from '@server/db/queue';

export default async () => {
	process
		.on('unhandledRejection', (reason, p) => {
			console.error(reason, 'Unhandled Rejection at Promise', p);
		})
		.on('uncaughtException', (err) => {
			console.error(err, 'Uncaught Exception thrown');
			// process.exit(1);
		});

	await getKeycloakKeys();

	await get_external_ip();
	get_internal_ip();

	await baseConfiguration();
	logo();

	writeFileSync('query.log', '');
	if (existsSync(transcodesPath)) {
		rmSync(transcodesPath, { recursive: true });
	}

	if (!setupComplete) {
		await firstBoot();
	} else {
		mediaDB();
		queueDB();
	}

	await refreshToken();

	await certificate();

	await moderators();

	await getUsers();

	await seed();

	await loadConfigs();

	await portMap();

	await server();

	queue();

	chromeCast();

	dev();

	watcher();

};
