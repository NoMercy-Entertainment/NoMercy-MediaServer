import { Request, Response } from 'express';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { KeycloakToken } from 'types/keycloak';

interface Payload extends JwtPayload {
	email: string;
	sub: string;
}

export const requestTokenParser = (req: Request, res: Response) => {
	const token = (req.header('authorization') as string)?.split('Bearer ')?.[1] ?? null;

	if (!token) {
		return res.status(401).json({
			status: 'error',
			message: 'You must provide a Bearer token.',
		});
	}

	const data: Payload = jwt_decode(token);
	return data;
};

export const tokenParser = (token: KeycloakToken['access_token']) => {
	const data: Payload = jwt_decode(token);
	return data;
};
