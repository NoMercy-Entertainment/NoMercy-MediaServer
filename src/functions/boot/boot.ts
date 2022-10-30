import { get_externa_ip, get_internal_ip, portMap } from '../networking';

import cdn from '../../loaders/cdn/cdn';
import certificate from '../certificate';
import dev from './dev';
import firstBoot from '../firstBoot';
import { getKeycloakKeys } from '../keycloak';
import loadConfigs from '../loadConfigs';
import logo from '../logo';
import moderators from '../moderators';
import queue from '../queue';
import refreshToken from '../refreshToken';
import seed from '../seed';
import server from '../../loaders/server';
import { setupComplete } from '../../state/';
import users from '../users';

export default async () => {

	await getKeycloakKeys();

	await get_externa_ip();
	await get_internal_ip();

	await cdn();
	logo();

	if (!setupComplete) {
		await firstBoot();
	}

	await refreshToken();
	await certificate();

	await moderators();
	await users();

	await seed();
	await loadConfigs();

	await portMap();

	await server();

	queue();

	await dev();

	return;
};
