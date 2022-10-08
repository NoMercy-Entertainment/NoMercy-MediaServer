import { AppState, useSelector } from '../../state/redux';
import axios, { AxiosResponse } from 'axios';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { sslCA, sslCert, sslKey, tokenFile } from '../../state';

import Logger from '../../functions/logger';
import { ServerCertificate } from 'types/api';
import certificateNeedsRenewal from './certificateNeedsRenewal';
import { deviceId } from '../system';
import open from 'open';

export default async () => {
	await refresh();
	refreshLoop();
};

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
			.then((response: AxiosResponse<ServerCertificate>) => {
				rmSync(sslKey, { force: true });
				rmSync(sslCert, { force: true });
				rmSync(sslCA, { force: true });
				writeFileSync(sslKey, response.data.private_key);
				writeFileSync(sslCA, response.data.certificate_authority);
				writeFileSync(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`);

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
						.then((response: AxiosResponse<ServerCertificate>) => {
							rmSync(sslKey, { force: true });
							rmSync(sslCert, { force: true });
							rmSync(sslCA, { force: true });
							writeFileSync(sslKey, response.data.private_key);
							writeFileSync(sslCA, response.data.certificate_authority);
							writeFileSync(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`);

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
