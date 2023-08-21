import { AppState, useSelector } from '@server/state/redux';
import { sslCert } from '@server/state';

import Logger from '@server/functions/logger';
import certificateNeedsRenewal from './certificateNeedsRenewal';
// import open from '@server/functions/open';

export const certificate = async () => {
	await refresh();
	refreshLoop();
};

export default certificate;

const refreshLoop = () => {
	setTimeout(() => {
		refresh();
		refreshLoop();
	}, 24 * 60 * 60 * 1000);
};

const refresh = () => {
	if (certificateNeedsRenewal(sslCert)) {

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Obtaining SSL certificate',
		});

		const accessToken: string = useSelector((state: AppState) => state.user.access_token);

		// await apiClient()
		// 	.get<ServerCertificate>(
		// 		`server/renewcertificate?server_id=${deviceId}`,
		// 		{
		// 			headers: {
		// 				Accept: 'application/json',
		// 				Authorization: `Bearer ${accessToken.replace(/\\r\\n/gu, '')}`,
		// 			},
		// 		}
		// 	)
		// 	.then(async (response: AxiosResponse<ServerCertificate>) => {
		// 		await Promise.all([
		// 			promises.rm(sslKey, { force: true }),
		// 			promises.rm(sslCert, { force: true }),
		// 			promises.rm(sslCA, { force: true }),
		// 		]);

		// 		await Promise.all([
		// 			promises.writeFile(sslKey, response.data.private_key),
		// 			promises.writeFile(sslCA, response.data.certificate_authority),
		// 			promises.writeFile(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`),
		// 		]);

		// 		Logger.log({
		// 			level: 'info',
		// 			name: 'setup',
		// 			color: 'blueBright',
		// 			message: 'New SSL certificate has been obtained',
		// 		});
		// 	})
		// 	.catch(async (error) => {
		// 		if (error.response) {
		// 			Logger.log({
		// 				level: 'info',
		// 				name: 'setup',
		// 				color: 'blueBright',
		// 				message: error.response.data.message,
		// 			});

		// 			const internal_ip = useSelector((state: AppState) => state.system.internal_ip);
		// 			const internal_port = useSelector((state: AppState) => state.system.secureInternalPort);
		// 			const redirect_uri = `http://${internal_ip}:${internal_port}/sso-callback`;

		// 			await open(
		// 				`https://auth.nomercy.tv/realms/NoMercyTV/protocol/openid-connect/auth?redirect_uri=${encodeURIComponent(
		// 					redirect_uri
		// 				)}&client_id=nomercy-server&response_type=code&module=certificate`,
		// 				{
		// 					wait: true,
		// 				}
		// 			);

		// 			const { access_token } = JSON.parse(
		// 				readFileSync(tokenFile, 'utf-8')
		// 			);

		// 			await apiClient()
		// 				.get<ServerCertificate>(
		// 					`server/renewcertificate?server_id=${deviceId}`,
		// 					{
		// 						headers: {
		// 							Accept: 'application/json',
		// 							Authorization: `Bearer ${access_token.replace(/\\r\\n/gu, '')}`,
		// 						},
		// 					}
		// 				)
		// 				.then(async (response: AxiosResponse<ServerCertificate>) => {
		// 					await Promise.all([
		// 						promises.rm(sslKey, { force: true }),
		// 						promises.rm(sslCert, { force: true }),
		// 						promises.rm(sslCA, { force: true }),
		// 					]);

		// 					await Promise.all([
		// 						promises.writeFile(sslKey, response.data.private_key),
		// 						promises.writeFile(sslCA, response.data.certificate_authority),
		// 						promises.writeFile(sslCert, `${response.data.certificate}\n${response.data.issuer_certificate}`),
		// 					]);

		// 					Logger.log({
		// 						level: 'info',
		// 						name: 'setup',
		// 						color: 'blueBright',
		// 						message: 'New SSL certificate has been obtained',
		// 					});
		// 				})
		// 				.catch((error) => {
		// 					console.error(error);
		// 					if (error.response) {
		// 						Logger.log({
		// 							level: 'info',
		// 							name: 'setup',
		// 							color: 'blueBright',
		// 							message: error.response.data.message,
		// 						});

		// 						// process.exit(1);
		// 					}
		// 				});
		// 		}
		// 	});
	}
};
