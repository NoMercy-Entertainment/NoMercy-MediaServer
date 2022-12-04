import { get_external_ip, get_internal_ip, portMap } from '../networking';

import cdn from '../../loaders/cdn/cdn';
import dev from './dev';
import firstBoot from '../firstBoot';
import { getKeycloakKeys } from '../keycloak';
import logo from '../logo';
import queue from '../queue';
import { setupComplete } from '../../state/';

export default async () => {

	await getKeycloakKeys();

	await get_external_ip();
	await get_internal_ip();

	await cdn();
	logo();

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

	await require('../../loaders/server').server();
	
	queue();

	dev();

};
