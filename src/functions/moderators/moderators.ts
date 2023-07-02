import Logger from '../../functions/logger';
import { ModeratorsResponse } from 'types/api';
import axios from '../axios';
import { setModerators } from '@/state/redux/config/actions';

export const moderators = async () => {
	setInterval(async () => {
		await getMods();
	}, 5 * 60 * 1000);
	await getMods();
};

export default moderators;

export const getMods = async () => {
	await axios()
		.get<ModeratorsResponse>('https://api.nomercy.tv/server/moderators', {
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
