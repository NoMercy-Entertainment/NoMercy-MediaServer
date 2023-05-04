import { AxiosResponse } from 'axios';
import Logger from '../../../functions/logger';
import { PaginatedResponse } from '../helpers';
import { Person } from '../people/person';
import { PersonImages } from './images';
import { PersonTranslations } from './translations';
import { PersonWithAppends } from '../people/details';
import i18next from 'i18next';
import tmdbApiClient from '../tmdbApiClient';

export * from './changes';
export * from './combined_credits';
export * from './external_ids';
export * from './images';
export * from './credits';
export * from './person';
export * from './details';
export * from './tagged_images';
export * from './translations';
export * from './trending';
export * from './credits';
export * from './person';

export const personAppend = ['details', 'combined_credits', 'movie_credits', 'credits', 'tv_credits', 'external_ids', 'images', 'translations'] as const;

export const person = async (id: number) => {
	const params = {
		params: {
			append_to_response: personAppend.join(','),
		},
	};

	const { data } = await tmdbApiClient.get<PersonWithAppends<typeof personAppend[number]>>(`person/${id}`, params);

	// data.movie_credits.crew[0].known_for_department

	return data;
};

export const peoplePopular = async (limit = 10) => {
	const arr: Person[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Person>>('popular/person', { params: { page: 1 } });

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Person>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<PaginatedResponse<Person>>('popular/person', {
				params: { page: i },
			})
		);
	}

	const data2 = await Promise.all(promises);

	for (let g = 0; g < data2.length && g < limit && g < 1000; g++) {
		for (let j = 0; j < data2[g].data.results.length; j++) {
			arr.push(data2[g].data.results[j]);
		}
	}

	return arr;
};

export const peopleImages = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching People Images',
	});

	const params = {
		params: {
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<PersonImages>(`person/${id}/images`, params);

	return data;
};

export const peopleTranslations = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching People Translations',
	});

	const { data } = await tmdbApiClient.get<PersonTranslations>(`person/${id}/translations`);

	return data;
};

export default Person;
