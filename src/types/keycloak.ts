import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';

import { Message } from './server';
import { Request } from 'express';

export interface KeycloakToken {
	access_token: string
	expires_in: number
	refresh_expires_in: number
	refresh_token: string
	token_type: string
	id_token: string
	'not-before-policy': number
	session_state: string
	scope: string
}

export interface User {
	email: string | undefined
	error: string | null
	firstName: string | null
	id: number | string
	moderator: boolean
	lastName: string | null
	loading: boolean
	messages: Array<Message>
	notifications: Array<Message>
	name: string | null
	accessToken: string | null
	refreshToken: string | null
}

export interface KC extends KeycloakTokenParsed {
	name: string
	email: string
	given_name: string
	family_name: string
	sub: string
	exp: number
}

export interface kc extends Keycloak {
	token: string
	refreshToken: string
	tokenParsed: KC
}

export interface KAuthRequest extends Request {
	kauth: {
		grant: {
			access_token: {
				token: string;
				clientId: string;
				header: {
					alg: string;
					typ: string;
					kid: string;
				};
				content: KC;
				signature: Buffer;
				signed: string;
			},
			refresh_token: string | undefined;
			id_token: string | undefined;
			token_type: string | undefined;
			expires_in: string | undefined;
			__raw: string;
		}
	};
}
