import Logger from '../../../functions/logger';
import { TVLatest } from './latest';
import fanartApiClient from '../fanartApiClient';
import { TvImages } from '@/providers/tmdb/tv';

export * from './tv';
export * from './latest';

export const tv = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: `Fetching TV Show Images with id: ${id}`,
	});

	const params = {
	};

	const { data } = await fanartApiClient.get<TvImages>(`tv/${id}`, params);

	return data;
};

export const tvLatest = async (date = Date.now()) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: 'Fetching TV Show Latest',
	});

	const { data } = await fanartApiClient.get<TVLatest>('tv/latest', {
		params: { date },
	});

	return data;
};
