import { sslCA, sslCert, sslKey } from '@server/state';

import Logger from '@server/functions/logger';
import certificateNeedsRenewal from './certificateNeedsRenewal';
import { getAccessToken } from '../auth/helpers';
import apiClient from '../apiClient/apiClient';
import { ServerCertificate } from '@server/types/api';
import { deviceId } from '../system';
import { AxiosResponse } from 'axios';
import { promises } from 'fs';

export const certificate = async () => {
	refresh();
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

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Obtaining SSL certificate',
		});

		await apiClient()
			.get<ServerCertificate>(`server/renewcertificate?server_id=${deviceId}`, {
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${getAccessToken()}`,
				},
			})
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
						color: 'red',
						message: error.response.data.message,
					});
				} else {
					Logger.log({
						level: 'info',
						name: 'setup',
						color: 'red',
						message: error.message,
					});
				}
			});
	}
};
