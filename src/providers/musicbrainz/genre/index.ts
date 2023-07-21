import Logger from '@server/functions/logger';
import mbApiClient from '../mbApiClient';
import { sleep } from '@server/functions/dateTime';

export interface PaginatedGenreResponse {
    'genre-count': number;
    'genre-offset': number;
    genres: Genre[];
}

export interface Genre {
    name: string;
    id: string;
    count?: number;
    disambiguation: string;
}

export const musicGenres = async () => {
	Logger.log({
		level: 'info',
		name: 'musicBrainz',
		color: 'blue',
		message: 'Fetching music genres',
	});

	try {

		const arr: Genre[] = [];

		const { data } = await mbApiClient.get<PaginatedGenreResponse>('genre/all', {
			params: {
				limit: 100,
				offset: 0,
			},
		});

		for (let j = 0; j < data.genres.length; j++) {
			arr.push(data.genres[j]);
		}

		for (let i = 1; i < Math.floor(data['genre-count'] / data.genres.length); i++) {

			const { data: data2 } = await mbApiClient.get<PaginatedGenreResponse>('genre/all', {
				params: {
					limit: data.genres.length,
					offset: i * data.genres.length,
				},
			});

			for (let j = 0; j < data2.genres.length; j++) {
				arr.push(data2.genres[j]);
			}

			sleep(750);
		}

		return arr;

	} catch (error) {
		Logger.log({
			level: 'info',
			name: 'musicBrainz',
			color: 'red',
			message: 'Error fetching music genres',
		});

		return [];
	}

};
