import { applicationPaths, configFile, tokenFile } from '@server/state/';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const createAppFolders = () => {
	for (let i = 0; i < Object.values(applicationPaths).length; i++) {
		const path = Object.values(applicationPaths)[i];
		mkdirSync(path, { recursive: true });
	}
	if (!existsSync(tokenFile)) {
		writeFileSync(tokenFile, JSON.stringify({}));
	}
	if (!existsSync(configFile)) {
		writeFileSync(configFile, JSON.stringify({}));
	}

	if (!existsSync(tokenFile)) {
		writeFileSync(tokenFile, '{}');
	}

	const tokens = JSON.parse(readFileSync(tokenFile, 'utf-8'));

	const access_token = tokens.access_token;
	globalThis.access_token = access_token;

	const refresh_token = tokens.refresh_token;
	globalThis.refresh_token = refresh_token;

	const expires_in = tokens.expires_in;
	globalThis.expires_in = expires_in;

	const refresh_expires_in = tokens.refresh_expires_in;
	globalThis.refresh_expires_in = refresh_expires_in;

	const token_type = tokens.token_type;
	globalThis.token_type = token_type;

	const id_token = tokens.id_token;
	globalThis.id_token = id_token;

	const nbp = tokens['not-before-policy'];
	globalThis.nbp = nbp;

	const session_state = tokens.session_state;
	globalThis.session_state = session_state;

	const scope = tokens.scope;
	globalThis.scope = scope;

};

export default createAppFolders;
