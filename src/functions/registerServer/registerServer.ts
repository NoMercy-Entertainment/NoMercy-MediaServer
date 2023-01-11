import { AppState, useSelector } from '../../state/redux';
import { deviceId, deviceName, platform } from '../system';
import express, { Request, Response } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { setAccessToken, setRefreshToken } from '../../state/redux/user/actions';

import DetectBrowsers from '../detectBrowsers';
import { KeycloakToken } from 'types/keycloak';
import Logger from '../../functions/logger';
import { ServerRegisterResponse } from 'types/api';
import axios from 'axios';
import http from 'http';
import inquirer from 'inquirer';
import { keycloak_key } from '../keycloak/config';
import open from 'open';
import qs from 'qs';
import { setOwner } from '../../state/redux/system/actions';
import { tokenFile } from '../../state';
import { tokenParser } from '../tokenParser';
import writeToConfigFile from '../writeToConfigFile';

const registerServer = async () => {
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	const external_ip = useSelector((state: AppState) => state.system.external_ip);
	const server_version = useSelector((state: AppState) => state.system.server_version);
	const internal_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != ''
		? parseInt(process.env.DEFAULT_PORT as string, 10)
		: 7635;
	const external_port: number = process.env.DEFAULT_PORT && process.env.DEFAULT_PORT != ''
		? parseInt(process.env.DEFAULT_PORT as string, 10)
		: 7635;
	let registerComplete = false;

	const redirect_uri = `http://${internal_ip}:${internal_port}/sso-callback`;

	const serverData = {
		server_id: deviceId,
		server_name: deviceName,
		internal_ip: internal_ip,
		internal_port: internal_port,
		external_ip: external_ip,
		external_port: external_port,
		server_version: server_version,
		platform: platform.toTitleCase(),
	};

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Registering server, this takes a moment...',
	});

	let success = true;

	await axios
		.post<ServerRegisterResponse>('https://api.nomercy.tv/server/register', serverData, {
			headers: { Accept: 'application/json' },
		})
		.catch((error) => {
			success = false;
			if (error.response) {
				Logger.log({
					level: 'info',
					name: 'setup',
					color: 'red',
					message: error?.response?.data?.message ?? error,
				});
			}
		});

	if (success || !JSON.parse(readFileSync(tokenFile, 'utf8'))?.access_token) {
		const detected = DetectBrowsers();

		if (detected) {
			await tempServer(redirect_uri, internal_port, registerComplete);

			Logger.log({
				level: 'info',
				name: 'setup',
				color: 'blueBright',
				message: 'Opening browser, please login to link your server',
			});

			await open(
				`https://auth.nomercy.tv/auth/realms/NoMercyTV/protocol/openid-connect/auth?redirect_uri=${encodeURIComponent(
					redirect_uri
				)}&client_id=nomercy-server&response_type=code`,
				{
					wait: true,
				}
			);

		} else {
			await loginPrompt().then(() => {
				registerComplete = true;
			});
		}

		await new Promise((resolve) => {
			// eslint-disable-next-line no-unmodified-loop-condition
			while (!registerComplete) {
				// /
			}
			resolve(true);
		});
	}
};

export default registerServer;

const tempServer = (redirect_uri: string, internal_port: number, registerComplete: boolean) => {
	const app = express();
	const httpsServer = http.createServer(app);

	app.get('/sso-callback', async (req: Request, res: Response) => {

		const keycloakData = qs.stringify({
			client_id: 'nomercy-server',
			grant_type: 'authorization_code',
			client_secret: keycloak_key,
			scope: 'openid offline_access',
			code: req.query.code,
			redirect_uri: redirect_uri,
		});

		await axios
			.post<KeycloakToken>(
				useSelector((state: AppState) => state.user.keycloakUrl),
				keycloakData
			)
			.then(({ data }) => {
				Logger.log({
					level: 'info',
					name: 'keycloak',
					color: 'blueBright',
					message: 'Server authenticated',
				});

				setAccessToken(data.access_token);
				setRefreshToken(data.refresh_token);

				const userId = tokenParser(data.access_token).sub;
				setOwner(userId);
				writeToConfigFile('user_id', userId);

				writeFileSync(tokenFile, JSON.stringify(data, null, 2));

				res.send('<script>window.close();</script>').end();

				registerComplete = true;
				httpsServer.close();
				return registerComplete;
			})
			.catch(({ response }) => {
				Logger.log({
					level: 'error',
					name: 'keycloak',
					color: 'red',
					message: JSON.stringify(response?.data ?? response, null, 2),
				});
				return res.json(response?.data);
			});
	});

	return httpsServer
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
		});
};

const login = ({ email, password, totp }) => {
	return new Promise(async (resolve, reject) => {
		const keycloakData = qs.stringify({
			client_id: 'nomercy-server',
			grant_type: 'password',
			client_secret: keycloak_key,
			scope: 'openid offline_access',
			username: email,
			password: password,
			totp: totp,
		});

		await axios
			.post<KeycloakToken>(
				useSelector((state: AppState) => state.user.keycloakUrl),
				keycloakData
			)
			.then(({ data }) => {
				Logger.log({
					level: 'info',
					name: 'keycloak',
					color: 'blueBright',
					message: 'Server authenticated',
				});

				setAccessToken(data.access_token);
				setRefreshToken(data.refresh_token);

				const userId = tokenParser(data.access_token).sub;
				setOwner(userId);
				writeToConfigFile('user_id', userId);

				writeFileSync(tokenFile, JSON.stringify(data));
				resolve(true);
			})
			.catch(({ response }) => {
				Logger.log({
					level: 'error',
					name: 'keycloak',
					color: 'red',
					message: JSON.stringify(response.data, null, 2),
				});
				reject(new Error(response.data));
			});
	});
};

const loginPrompt = () => {
	return new Promise((resolve) => {
		inquirer
			.prompt([
				{
					type: 'input',
					name: 'email',
					message: 'Email address: ',
				},
				{
					type: 'password',
					name: 'password',
					message: 'Password: ',
				},
				{
					type: 'input',
					name: 'totp',
					message: '2fa code: ',
				},
			])
			.then((answers) => {
				login({
					email: answers.email,
					password: answers.password,
					totp: isNaN(answers.totp)
						? undefined
						: answers.totp,
				}).then(resolve);
			})
			.catch((error) => {
				if (error.isTtyError) {
				// Prompt couldn't be rendered in the current environment
				} else {
				// Something else went wrong
				}
			});
	});
};
