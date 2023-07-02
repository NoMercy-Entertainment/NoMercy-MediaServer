import Logger from '../../../functions/logger';
import { MovieLatest } from './latest';
import fanartApiClient from '../fanartApiClient';
import { MovieImages } from '@/providers/tmdb/movie';

export * from './latest';
export * from './movie';

export const movieImages = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: `Fetching Movie Images with id: ${id}`,
	});

	const params = {
	};

	const { data } = await fanartApiClient.get<MovieImages>(`movies/${id}`, params);

	return data;
};

export const movieLatest = async () => {
	Logger.log({
		level: 'info',
		name: 'fanart',
		color: 'blue',
		message: 'Fetching Movie Lastest',
	});

	const { data } = await fanartApiClient.get<MovieLatest>('movies/latest');

	return data;
};
