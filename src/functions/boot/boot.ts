import { existsSync, rmSync } from 'fs';

import cdn from '../../loaders/cdn/cdn';
import { setupComplete, transcodesPath } from '../../state';
import chromeCast from '../chromeCast';
import firstBoot from '../firstBoot';
import { getKeycloakKeys } from '../keycloak';
import logo from '../logo';
import { get_external_ip, get_internal_ip, portMap } from '../networking';
import queue from '../queue';
import dev from './dev';

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
	await get_internal_ip();

	await cdn();
	logo();

	if (existsSync(transcodesPath)) {
		rmSync(transcodesPath, { recursive: true });
	}

	if (!setupComplete) {
		await firstBoot();
	}

	await (await import('../refreshToken/refreshToken')).refreshToken();

	await (await import('../certificate/certificate')).certificate();

	await (await import('../moderators/moderators')).moderators();

	await (await import('../users/users')).getUsers();

	await (await import('../seed/seed')).seed();

	await (await import('../loadConfigs/loadConfigs')).loadConfigs();

	await portMap();

	await (await import('../../loaders/server')).server();

	queue();

	chromeCast();

	dev();

};
