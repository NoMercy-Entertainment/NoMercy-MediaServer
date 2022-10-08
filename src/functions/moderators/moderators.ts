import { ModeratorsResponse } from 'types/api';

import axios from '../axios';
import { setModerators } from '../../state/redux/config/actions';
import Logger from '../../functions/logger';

export default async (): Promise<void> => {
	setInterval(async () => {
		await getMods();
	}, 1 * 60 * 1000);
	await getMods();
};

export const getMods = async (): Promise<void> => {
	await axios()
		.get<ModeratorsResponse>('https://api.nomercy.tv/server/moderators')
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
