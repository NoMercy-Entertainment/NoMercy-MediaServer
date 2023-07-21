import { DiscoverMovieParams } from '../discover';
import { MovieChange, MovieChanges } from './changes';
import { Recommendations } from '../shared';

import { AxiosResponse } from 'axios';
import Logger from '@server/functions/logger';
import { Movie } from './movie';
import { MovieGenre } from '../genres/movie_genre';
import { MovieImages } from './images';
import { MovieLatest } from './latest';
import { MoviePopular } from './popular';
import { MovieTranslations } from './translations';
import { MovieVideos } from './videos';
import { MovieWithAppends } from './movie-details';
import { PaginatedResponse } from '../helpers';
import i18next from 'i18next';
import moment from 'moment';
import tmdbApiClient from '../tmdbApiClient';

export * from './account_states';
export * from './alternative_titles';
export * from './certifications';
export * from './changes';
export * from './external_ids';
export * from './images';
export * from './keywords';
export * from './latest';
export * from './movie';
export * from './movie-details';
export * from './movie_credits';
export * from './now_playing';
export * from './on_the_air';
export * from './popular';
export * from './recommendations';
export * from './release_dates';
export * from './reviews';
export * from './similar';
export * from './top_rated';
export * from './translations';
export * from './trending';
export * from './upcomming';
export * from './videos';
export * from './watch_providers';

export const movieAppend = [
	'alternative_titles',
	'release_dates',
	'credits',
	'keywords',
	'recommendations',
	'similar',
	'translations',
	'external_ids',
	'videos',
	'images',
	'watch/providers',
] as const;

export const movie = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie with id: ${id}`,
	});

	const params = {
		params: {
			append_to_response: movieAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
			include_video_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<MovieWithAppends<typeof movieAppend[number]>>(`movie/${id}`, params);

	return data;
};

export const movieChanges = async (id: number, daysBack = 1): Promise<MovieChange[]> => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie Changes with id: ${id}`,
	});

	if (daysBack > 14) {
		daysBack = 14;
	}

	const params = {
		params: {
			start_date: moment().subtract(daysBack, 'days')
				.format('YYYY-MM-DD'),
			end_date: moment().format('YYYY-MM-DD'),
		},
	};

	const { data } = await tmdbApiClient.get<MovieChanges>(`movie/${id}/changes`, params);

	return data.changes;
};

export const movieDiscover = async (params?: DiscoverMovieParams, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Discover',
	});

	const arr: Movie[] = [];

	params = {
		page: 1,
	};

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('discover/movie', {
		params,
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<PaginatedResponse<Movie>>('discover/movie', {
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

export const movieGenre = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<MovieGenre>('genre/movie/list', params);

	return data.genres;
};

export const movieImages = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie Images with id: ${id}`,
	});

	const params = {
		params: {
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<MovieImages>(`movie/${id}/images`, params);

	return data;
};

export const movieLatest = async () => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Lastest',
	});

	const { data } = await tmdbApiClient.get<MovieLatest>('movie/latest');

	return data;
};

export const movieNowPlaying = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Now Playing',
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/now_playing', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<PaginatedResponse<Movie>>('discover/movie', {
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

export const moviePopular = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'fetching Movie Popular',
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/popular', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<MoviePopular>('movie/popular', {
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

export const movieRecommendations = async (id: number, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie Recommendations with id: ${id}`,
	});
	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<Recommendations<Movie>>(`movie/${id}/recommendations`, {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<Recommendations<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<Recommendations<Movie>>(`movie/${id}/recommendations`, {
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

export const movieSimilar = async (id: number, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fething Movie Similar with id: ${id}`,
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>(`movie/${id}/similar`, {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<PaginatedResponse<Movie>>(`movie/${id}/similar`, {
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

export const movieTopRated = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Top Rated',
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/top_rated', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		const { data: data2 } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/top_rated', { params: { page: i } });
		for (let j = 0; j < data2.results.length; j++) {
			arr.push(data2.results[j]);
		}
	}

	return arr;
};

export const movieTrending = async (window = 'day', limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Trending id',
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>(`trending/movie/${window}`, { params: { page: 1 } });

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<Movie>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			tmdbApiClient.get<PaginatedResponse<Movie>>(`trending/movie/${window}`, {
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

export const movieUpcomming = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching Movie Upcomming',
	});

	const arr: Movie[] = [];

	const { data } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/upcomming', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		const { data: data2 } = await tmdbApiClient.get<PaginatedResponse<Movie>>('movie/upcomming', {
			params: { page: i },
		});

		for (let j = 0; j < data2.results.length; j++) {
			arr.push(data2.results[j]);
		}
	}

	return arr;
};

export const movieVideos = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie Videos with id: ${id}`,
	});

	const params = {
		params: {
			language: 'null',
		},
	};

	const { data } = await tmdbApiClient.get<MovieVideos>(`movie/${id}/videos`, params);

	return data.results;
};

export const movieTranslations = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Movie Translations with id: ${id}`,
	});

	const { data } = await tmdbApiClient.get<MovieTranslations>(`movie/${id}/translations`);

	return data;
};
