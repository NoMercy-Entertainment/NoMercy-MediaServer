import Logger from '@server/functions/logger';
import { ModeratorsResponse } from '@server/types/api';
import apiClient from '../apiClient';
import { setModerators } from '@server/state/redux/config/actions';

export const moderators = async () => {
	setInterval(async () => {
		await getMods();
	}, 5 * 60 * 1000);
	await getMods();
};

export default moderators;

export const getMods = async () => {
	await apiClient()
		.get<ModeratorsResponse>('server/moderators', {
			timeout: 1 * 60 * 1000,
		})
		.then(({ data }) => {
			setModerators(data.data);
		})
		.catch((error) => {
			Logger.log({
				level: 'error',
				name: 'moderators',
				color: 'red',
				message: error?.response?.data?.message ?? error,
			});
		});
};
