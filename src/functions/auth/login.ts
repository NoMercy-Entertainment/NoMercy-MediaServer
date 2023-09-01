import { tokenFile } from "@server/state";
import { useSelector, AppState } from "@server/state/redux";
import { KeycloakToken } from "@server/types/keycloak";
import { writeFileSync } from "fs";
import apiClient from "../apiClient";
import { tokenParser } from "../tokenParser";
import writeToConfigFile from "../writeToConfigFile";
import Logger from "../logger";
import DetectBrowsers from '../detectBrowsers';
import open from 'open';
import { authorizeUrlString } from './helpers';
import { input, password } from '@inquirer/prompts';

export const aquireToken = async () => {
	
	const detected = DetectBrowsers();

	if (detected) {
		return browserLogin(() => {
			return true;
		});
	} else {
		return passwordLogin(() => {
			return true;
		});
	}
	
};

export const browserLogin = async (cb: () => void) => {
	
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const internal_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != '' && !isNaN(parseInt(process.env.DEFAULT_PORT as string, 10))
		? parseInt(process.env.DEFAULT_PORT as string, 10)
		: 7635;

	const redirect_uri = `http://${internal_ip}:${internal_port}/sso-callback`;

	const detected = DetectBrowsers();

	if (detected) {

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Opening browser, please login',
		});

		await open(await authorizeUrlString(redirect_uri), {
			wait: true,
		});

		cb();

	} else {
		await passwordLogin(cb)
	}
};

export const passwordLogin = async (cb: () => void) => {

	return new Promise(async (resolve, reject) => {

		const { email, password, totp } = await loginPrompt();

		const passwordGrantData = new URLSearchParams({
			client_id: globalThis.client_id,
			grant_type: 'password',
			client_secret: globalThis.client_secret,
			scope: globalThis.authorizationScopes,
			username: email,
			password: password,
			totp: totp,
		}).toString();

		await apiClient()
			.post<KeycloakToken>(globalThis.tokenUrl, passwordGrantData)
			.then(({ data }) => {
				Logger.log({
					level: 'info',
					name: 'auth',
					color: 'blueBright',
					message: 'Server authenticated',
				});

				globalThis.accessToken = data.access_token;
				globalThis.refreshToken = data.refresh_token;

				const userId = tokenParser(data.access_token).sub;
				writeToConfigFile('user_id', userId);

				if (data.access_token) {
					writeFileSync(tokenFile, JSON.stringify(data, null, 2));
				}
			})
			.then(async () => {
				cb();
				resolve(true);
			})
			.catch(({ response }) => {
				Logger.log({
					level: 'error',
					name: 'auth',
					color: 'red',
					message: JSON.stringify(response.data, null, 2),
				});
				reject(new Error(response.data));
			});
	});
};

export const loginPrompt = (): Promise<{ email: string, password: string, totp: string }> => {
	return new Promise(async (resolve) => {

		console.log('Please login to continue');

		const email = await input({
			message: 'Email address'
		});

		const pass = await  password({
			message: 'Password: '
		});

		const totp = await input({
			message: '2fa code: ', 
			validate: (value: string) => !value || !isNaN(parseInt(value, 10)),
		});

		resolve({
			email: email,
			password: pass,
			totp: totp,
		});
	});
};
