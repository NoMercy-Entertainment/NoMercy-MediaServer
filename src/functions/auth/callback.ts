import { tokenFile } from "@server/state";
import { useSelector, AppState } from "@server/state/redux";
import { KeycloakToken } from "@server/types/keycloak";
import axios from "axios";
import { writeFileSync } from "fs";
import { tokenParser } from "../tokenParser";
import writeToConfigFile from "../writeToConfigFile";
import { Request, Response } from "express-serve-static-core";
import Logger from "../logger";
import { selectConfiguration } from "@server/db/media/actions/configuration";

export async function callback(req: Request, res: Response) {
	const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
	
	const dbConf = selectConfiguration();
	const secureInternalPort = parseInt((dbConf.find(conf => conf.key == 'secureInternalPort')?.value as string ?? process.env.DEFAULT_PORT), 10);

	const redirect_uri = `http://${internal_ip}:${secureInternalPort}/sso-callback`;

	const authorizationCodeParams = new URLSearchParams({
		client_id: globalThis.client_id,
		grant_type: 'authorization_code',
		client_secret: globalThis.client_secret,
		scope: globalThis.authorizationScopes,
		code: req.query.code as string,
		redirect_uri: redirect_uri,
		code_verifier: globalThis.codeVerifier,
	}).toString();

	await axios
		.post<KeycloakToken>(globalThis.tokenUrl, authorizationCodeParams)
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

			res.send('<script>window.close();</script>').end();
		})
		.catch(({ response }) => {
			Logger.log({
				level: 'error',
				name: 'auth',
				color: 'red',
				message: JSON.stringify(response.data, null, 2),
			});
			return res.json(response.data);
		});
}