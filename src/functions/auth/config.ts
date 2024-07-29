import { realm } from '../keycloak/config';

export const authBaseUrl = `${realm}/protocol/openid-connect`;
globalThis.authBaseUrl = authBaseUrl;

export const tokenUrl = `${authBaseUrl}/token`;
globalThis.tokenUrl = tokenUrl;

export const authorizeUrl = `${authBaseUrl}/auth`;
globalThis.authorizeUrl = authorizeUrl;

export const authorizationScopes = 'openid profile email';
globalThis.authorizationScopes = authorizationScopes;

export const client_id = 'nomercy-server';
globalThis.client_id = client_id;

export const client_secret = '';
globalThis.client_secret = client_secret;

export const public_key = '';
globalThis.public_key = public_key;

export const allowedUsers = [];
globalThis.allowedUsers = allowedUsers;

export const codeVerifier = '';
globalThis.codeVerifier = codeVerifier;
