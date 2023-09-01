import { existsSync, readFileSync, writeFileSync } from "fs";
import { tokenFile } from "@server/state";

export const authBaseUrl = `https://dev${process.env.ROUTE_SUFFIX ?? ''}.nomercy.tv/oauth/`;
globalThis.authBaseUrl = authBaseUrl;

export const tokenUrl = `${globalThis.authBaseUrl}token`;
globalThis.tokenUrl = tokenUrl;

export const authorizeUrl = `${globalThis.authBaseUrl}authorize`;
globalThis.authorizeUrl = authorizeUrl;

export const authorizationScopes = 'openid profile email';
globalThis.authorizationScopes = authorizationScopes;

export const client_id = '';
globalThis.client_id = client_id;

export const client_secret = '';
globalThis.client_secret = client_secret;

export const public_key = '';
globalThis.public_key = public_key;

export const allowedUsers = [];
globalThis.allowedUsers = allowedUsers;

export const codeVerifier = '';
globalThis.codeVerifier = codeVerifier;

if (!existsSync(tokenFile)) {
	writeFileSync(tokenFile, '{}');
}

const tokens = JSON.parse(readFileSync(tokenFile, 'utf-8'));

const access_token = tokens.access_token;
globalThis.access_token = access_token

const refresh_token = tokens.refresh_token;
globalThis.refresh_token = refresh_token

const expires_in = tokens.expires_in;
globalThis.expires_in = expires_in

const refresh_expires_in = tokens.refresh_expires_in;
globalThis.refresh_expires_in = refresh_expires_in

const token_type = tokens.token_type;
globalThis.token_type = token_type

const id_token = tokens.id_token;
globalThis.id_token = id_token

const nbp = tokens['not-before-policy'];
globalThis.nbp = nbp

const session_state = tokens.session_state;
globalThis.session_state = session_state

const scope = tokens.scope;
globalThis.scope = scope
