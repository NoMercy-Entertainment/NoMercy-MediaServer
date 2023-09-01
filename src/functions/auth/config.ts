
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
