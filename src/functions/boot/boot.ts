import env from 'dotenv';
env.config({
	path: `${__dirname}/../.env`,
});

import moderators from '../../functions/moderators';
import cdn from '../../loaders/cdn/cdn';
import server from '../../loaders/server';
import certificate from '../certificate';
import firstBoot from '../firstBoot';
import refreshToken from '../refreshToken';
import seed from '../seed';
import { get_externa_ip, get_internal_ip, portMap } from '../networking';
import { setupComplete } from '../../state/';
import users from '../users';
import queue from '../queue';
import loadConfigs from '../loadConfigs';
import logo from '../logo';
import { getKeycloakKeys } from '../../functions/keycloak';

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
};
