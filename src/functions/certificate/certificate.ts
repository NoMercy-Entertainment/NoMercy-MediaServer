import { AppState, useSelector } from '@/state/redux';
import axios, { AxiosResponse } from 'axios';
import { promises, readFileSync } from 'fs';
import { sslCA, sslCert, sslKey, tokenFile } from '@/state';

import Logger from '../../functions/logger';
import { ServerCertificate } from 'types/api';
import certificateNeedsRenewal from './certificateNeedsRenewal';
import { deviceId } from '../system';
import open from 'open';

export const certificate = async () => {
	await refresh();
	refreshLoop();
};

export default certificate;

const refreshLoop = () => {
	setTimeout(async () => {
		await refresh();
		refreshLoop();
	}, 24 * 60 * 60 * 1000);
};

const refresh = async () => {
	if (certificateNeedsRenewal(sslCert)) {
		const accessToken = useSelector((state: AppState) => state.user.access_token);

		await axios
			.get<ServerCertificate>(
				`https://api.nomercy.tv/server/renewcertificate?server_id=${deviceId}`,
				{
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
				}
			)
			.then(async (response: AxiosResponse<ServerCertificate>) => {
				await Promise.all([
					promises.rm(sslKey, { force: true }),
					promises.rm(sslCert, { force: true }),
					promises.rm(sslCA, { force: true }),
				]);

				await Promise.all([
					promises.writeFile(sslKey, response.data.private_key),
					promises.writeFile(sslCA, response.data.certificate_authority),
					promises.writeFile(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`),
				]);

				Logger.log({
					level: 'info',
					name: 'setup',
					color: 'blueBright',
					message: 'New SSL certificate has been obtained',
				});
			})
			.catch(async (error) => {
				if (error.response) {
					Logger.log({
						level: 'info',
						name: 'setup',
						color: 'blueBright',
						message: error.response.data.message,
					});

					const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
					const internal_port = useSelector((state: AppState) => state.system.secureInternalPort);
					const redirect_uri = `http://${internal_ip}:${internal_port}/sso-callback`;

					await open(
						`https://auth.nomercy.tv/auth/realms/NoMercyTV/protocol/openid-connect/auth?redirect_uri=${encodeURIComponent(
							redirect_uri
						)}&client_id=nomercy-server&response_type=code`,
						{
							wait: true,
						}
					);

					const { access_token } = JSON.parse(
						readFileSync(tokenFile, 'utf-8')
					);

					await axios
						.get<ServerCertificate>(
							`https://api.nomercy.tv/server/renewcertificate?server_id=${deviceId}`,
							{
								headers: {
									Accept: 'application/json',
									Authorization: `Bearer ${access_token}`,
								},
							}
						)
						.then(async (response: AxiosResponse<ServerCertificate>) => {
							await Promise.all([
								promises.rm(sslKey, { force: true }),
								promises.rm(sslCert, { force: true }),
								promises.rm(sslCA, { force: true }),
							]);

							await Promise.all([
								promises.writeFile(sslKey, response.data.private_key),
								promises.writeFile(sslCA, response.data.certificate_authority),
								promises.writeFile(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`),
							]);

							Logger.log({
								level: 'info',
								name: 'setup',
								color: 'blueBright',
								message: 'New SSL certificate has been obtained',
							});
						})
						.catch((error) => {
							console.error(error);
							if (error.response) {
								Logger.log({
									level: 'info',
									name: 'setup',
									color: 'blueBright',
									message: error.response.data.message,
								});

								// process.exit(1);
							}
						});
				}
			});
	}
};
