import Logger from '../../functions/logger';
import { sslCA, sslCert, sslKey } from '../../state';
import certificateNeedsRenewal from './certificateNeedsRenewal';
import { ServerCertificate } from 'types/api';
import { rmSync, writeFileSync } from 'fs';
import { deviceId } from '../system';
import { AppState, useSelector } from '../../state/redux';
import axios, { AxiosResponse } from 'axios';

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

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Certificate is due renewal, Obtaining new SSL certificate...',
		});

		const response = await axios
			.get<ServerCertificate>(`https://api.nomercy.tv/server/renewcertificate?server_id=${deviceId}`, {
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.catch(async (error) => {
				if (error.response) {
					Logger.log({
						level: 'info',
						name: 'setup',
						color: 'blueBright',
						message: error.response.data.message,
					});
				}
			});

		rmSync(sslKey, { force: true });
		rmSync(sslCert, { force: true });
		rmSync(sslCA, { force: true });
		writeFileSync(sslKey, (response as AxiosResponse<ServerCertificate>).data.private_key);
		writeFileSync(sslCA, (response as AxiosResponse<ServerCertificate>).data.certificate_authority);
		writeFileSync(
			sslCert,
			`${(response as AxiosResponse<ServerCertificate>).data.certificate}\n${
				(response as AxiosResponse<ServerCertificate>).data.issuer_certificate
			}`
		);

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'New SSL certificate has been obtained',
		});
	}
};
