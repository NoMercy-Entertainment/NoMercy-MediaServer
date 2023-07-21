import Logger from '@server/functions/logger';
import tmdbApiClient from '../tmdbApiClient';
import {
    sortByMatchPercentage
} from '@server/functions/stringArray';
import { Collection } from '../collection/collection';
import { Company } from '../company/company';
import { PaginatedResponse } from '../helpers';
import { Keyword } from '../keywords/keyword';
import { Movie } from '../movie/movie';
import { Person } from '../people/person';
import { TvShow } from '../tv/tv';

export * from './search';
export * from './search-result';

export const searchCollection = async (query: string): Promise<Collection[]> => {

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Collection Search for: ${query}`,
	});

	const params = {
		params: {
			query: query.replace(/[\s\.]{1,}and[\s\.]{1,}/u, '&').replace(/\s/gu, '%20'),
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Collection>>('search/collection', params);

	return data.results || [];
};

export const searchCompany = async (query: string): Promise<Company[]> => {

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Company Search for: ${query}`,
	});
	const params = {
		params: {
			query: query.replace(/\s/gu, '%20'),
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Company>>('search/company', params);

	return data.results || [];
};

export const searchKeyword = async (query: string): Promise<Keyword[]> => {

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Keyword Search for: ${query}`,
	});
	const params = {
		params: {
			query: query.replace(/\s/gu, '%20'),
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Keyword>>('search/keyword', params);

	return data.results || [];
};

export const searchMovie = async (query: string, year: number | null = null): Promise<Movie[]> => {
	query = query?.replace(/[\s\.]{1,}and[\s\.]{1,}/u, '&')
		.split('.(')[0].replace(/([a-z])\./gu, '$1 ')
		.replace(/([A-Z])\.([A-Z][^A-Z.])/gu, '$1 $2');

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Movie Search for: ${query} ${year}`,
	});

	const params = {
		params: {
			query: query,
			primary_release_year: year,
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('search/movie', params);

	return sortByMatchPercentage(
		data.results?.filter(
			d => !d.title.includes('OVA') || !d.title.includes('ova') || !d.title.includes('Making of') || !d.title.includes('making of')
		) || [],
		'title',
		query
	);
};

export const searchMulti = async (query: string, year: number | string | null = null): Promise<(Person | Movie | TvShow)[]> => {

	query = query
		.split('.(')[0].replace(/([a-z])\./gu, '$1 ')
		.replace(/([A-Z])\.([A-Z][^A-Z.])/gu, '$1 $2');

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Multi Search for: ${query} ${year}`,
	});

	const params = {
		params: {
			query: query,
			primary_release_year: year,
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Person | Movie | TvShow>>('search/multi', params);

	return data.results ?? [];
};

export const searchPeople = async (query: string): Promise<Person[]> => {

	query = query
		.split('.(')[0].replace(/([a-z])\./gu, '$1 ')
		.replace(/([A-Z])\.([A-Z][^A-Z.])/gu, '$1 $2');

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}


	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `People Search for: ${query}`,
	});

	const params = {
		params: {
			query: query,
			include_adult: (process.env.ALLOW_ADULT as string) == 'true' ?? false,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Person>>('search/person', params);

	return data.results || [];
};

export const searchTv = async (query: string, year: number | null = null): Promise<TvShow[]> => {
	query = query?.replace(/[\s\.]{1,}and[\s\.]{1,}/u, '&')
		.split('.(')[0].replace(/([a-z])\./gu, '$1 ')
		.replace(/([A-Z])\.([A-Z][^A-Z.])/gu, '$1 $2');

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});

		return [];
	}

	if (!query) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'red',
			message: 'No query given',
		});
	}

	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `TV Show Search for: ${query} ${year}`,
	});

	const params = {
		params: {
			query,
			first_air_date_year: year,
		},
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<TvShow>>('search/tv', params);

	return sortByMatchPercentage(data.results?.filter(d => !d.name.includes('OVA') || !d.name.includes('ova')) || [], 'name', query);
};

export default {
	searchCollection,
	searchCompany,
	searchKeyword,
	searchMovie,
	searchMulti,
	searchPeople,
	searchTv,
};
