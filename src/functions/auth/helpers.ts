import jwtDecode from './jwt-decode';
import type { DecodedToken } from './helpers.d';
import http from 'http';
import express from 'express';
import { tokenFile } from '@server/state';
import { readFileSync } from 'fs';
import Logger from '../logger';
import { callback } from './callback';
import { getAuthKeys } from '../keycloak';

export let tempServerEnabled = false;

export function generateCodeVerifier(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export async function generateCodeChallenge(codeVerifier) {

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashBase64 = base64URLEncode(hashArray);
	return hashBase64;
}

export function base64URLEncode(data: number[]) {
	return btoa(String.fromCharCode.apply(null, data))
		.replace(/\+/gu, '-')
		.replace(/\//gu, '_')
		.replace(/[=]/gu, '');
}

export async function generatePKCE() {
	const state = generateCodeVerifier(40);
	const verifier = generateCodeVerifier(128);
	const challenge = await generateCodeChallenge(verifier);

	return {
		state: state,
		codeVerifier: verifier,
		codeChallenge: challenge,
	};
}

export function parseToken<T = DecodedToken>(token: string) {

	return jwtDecode(token) as T;
}

export async function authorizeUrlString(redirect_uri: string) {

	await getAuthKeys();

	const pkce = await generatePKCE();

	globalThis.codeVerifier = pkce.codeVerifier;

	const queryParams = new URLSearchParams({
		client_id: globalThis.client_id,
		redirect_uri: redirect_uri,
		response_type: 'code',
		scope: globalThis.authorizationScopes,
		state: pkce.state,
		code_challenge: pkce.codeChallenge,
		code_challenge_method: 'S256',
	});

	// console.log(globalThis.authorizeUrl, queryParams);

	return `${globalThis.authorizeUrl}?${queryParams.toString()}`;
}

export const tempServer = (internal_port: number) => {

	const app = express();
	const httpsServer = http.createServer(app);

	app.get('/sso-callback', callback);

	httpsServer
		.listen(internal_port, '0.0.0.0', () => {
			console.log(`listening on port ${internal_port}`);
		})
		.on('error', (error) => {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'magentaBright',
				message: `Sorry Something went wrong starting the secure server: ${JSON.stringify(error, null, 2)}`,
			});
			process.exit(1);
		})
		.on('close', () => {
			tempServerEnabled = false;
		});

	return httpsServer;
};

export const getAccessToken = (): string => {
	return JSON.parse(readFileSync(tokenFile, 'utf-8'))?.access_token as string;
};

export const getRefreshToken = (): string => {
	return JSON.parse(readFileSync(tokenFile, 'utf-8'))?.refresh_token as string;
};

export const getIdToken = (): string => {
	return JSON.parse(readFileSync(tokenFile, 'utf-8'))?.id_token as string;
};

export const getTokenExpiration = (): number => {
	return JSON.parse(readFileSync(tokenFile, 'utf-8'))?.expires_in as number;
};
