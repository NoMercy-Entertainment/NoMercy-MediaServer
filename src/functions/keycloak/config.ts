import { AppState, useSelector } from '@server/state/redux';

import { SessionOptions } from 'express-session';

export const keycloak_key = 'vbz8elvBVVTIWsX7tKB2LmI5FzDbItbN';

export const session_config: SessionOptions = {
	secret: keycloak_key,
	resave: false,
	saveUninitialized: true,
	cookie: {
		sameSite: 'lax',
		domain: 'nomercy.tv',
		httpOnly: true,
		secure: true,
		expires: new Date(31 * 24 * 60 * 60 * 1000),
		maxAge: 31 * 24 * 60 * 60 * 1000,
	},
};

export default {
	realm: 'NoMercyTV',
	'bearer-only': true,
	'auth-server-url': 'https://auth.nomercy.tv',
	'ssl-required': 'all',
	resource: 'nomercy-server',
	'verify-token-audience': true,
	'use-resource-role-mappings': true,
	'confidential-port': 0,
	public_key: useSelector((state: AppState) => state.config.publicKey),
};
