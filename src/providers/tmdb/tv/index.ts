import { AxiosResponse } from 'axios';
import { DiscoverTvShowParams } from '../discover/discover_tv';
import Logger from '@server/functions/logger';
import { PaginatedResponse } from '../helpers';
import { TrendingTvShows } from './trending';
import { TvChange } from './changes';
import { TvChanges } from '.';
import { TvGenre } from '../genres/tv_genres';
import { TvImages } from './images';
import { TvLatest } from './latest';
import { TvShow } from './tv';
import { TvShowTranslations } from './translations';
import { TvVideos } from './videos';
import { TvWithAppends } from './details';
import i18next from 'i18next';
import moment from 'moment';
import tmdbClient from '../tmdbClient';

export * from './account_states';
export * from './aggregate_credits';
export * from './airing_today';
export * from './alternative_title';
export * from './changes';
export * from './content_ratings';
export * from './episode_groups';
export * from './external_ids';
export * from './images';
export * from './keywords';
export * from './latest';
export * from './on_the_air';
export * from './popular';
export * from './recommendations';
export * from './reviews';
export * from './screened_theatrically';
export * from './similar';
export * from './top_rated';
export * from './translations';
export * from './trending';
export * from './details';
export * from './tv';
export * from './tv_credits';
export * from './videos';
export * from './watch_providers';

export const tvAppend = [
	'aggregate_credits',
	'alternative_titles',
	'content_ratings',
	'credits',
	'external_ids',
	'images',
	'keywords',
	'recommendations',
	'similar',
	'translations',
	'videos',
	'watch/providers',
] as const;

export const tv = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show with id: ${id}`,
	});

	const params = {
		params: {
			append_to_response: tvAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
			include_video_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await new tmdbClient().get<TvWithAppends<typeof tvAppend[number]>>(`tv/${id}`, params);

	return data;
};

export const tvChanges = async (id: number, daysBack = 1): Promise<TvChange[]> => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show Changes with id: ${id}`,
	});

	if (daysBack > 14) {
		daysBack = 14;
	}

	const params = {
		params: {
			start_date: moment()
				.subtract(daysBack, 'days')
				.format('YYYY-MM-DD'),
			end_date: moment()
				.format('YYYY-MM-DD'),
		},
	};

	const { data } = await new tmdbClient().get<TvChanges>(`tv/${id}/changes`, params);

	return data.changes;
};

export const tvDiscover = async (params?: DiscoverTvShowParams, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching TV Shows Discover',
	});

	const arr: TvShow[] = [];

	params = {
		page: 1,
		with_networks: params?.with_networks
			?			params.with_networks
			:			'213',
	};

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>('discover/tv', {
		params,
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>('discover/tv', {
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

export const tvGenre = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await new tmdbClient().get<TvGenre>('genre/tv/list', params);

	return data.genres;
};

export const tvImages = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show Images with id: ${id}`,
	});

	const params = {
		params: {
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await new tmdbClient().get<TvImages>(`tv/${id}/images`, params);

	return data;
};

export const tvLatest = async () => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching TV Show Latest',
	});

	const { data } = await new tmdbClient().get<TvLatest>('tv/latest', {
		params: { page: 1 },
	});

	return data;
};

export const tvOnTheAir = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'fetching TV Show Now Airing',
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>('tv/on_the_air', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>('tv/on_the_air', {
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

export const tvPopular = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'fetching TV Shows Popular',
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>('tv/popular', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>('tv/popular', {
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

export const tvRecommendations = async (id: number, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show Recommendations with id: ${id}`,
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>(`tv/${id}/recommendations`, { params: { page: 1 } });

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>(`tv/${id}/recommendations`, {
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

export const tvSimilar = async (id: number, limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Shows Similar with id: ${id}`,
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>(`tv/${id}/similar`, {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>(`tv/${id}/similar`, {
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

export const tvTopRated = async (limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching TV Shows Top Rated',
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>('tv/top_rated', {
		params: { page: 1 },
	});

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<PaginatedResponse<TvShow>>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>('tv/top_rated', {
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

export const tvTrending = async (window = 'day', limit = 10) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: 'Fetching TV Shows Trending',
	});

	const arr: TvShow[] = [];

	const { data } = await new tmdbClient().get<PaginatedResponse<TvShow>>(`trending/tv/${window}`, { params: { page: 1 } });

	for (let j = 0; j < data.results.length; j++) {
		arr.push(data.results[j]);
	}

	const promises: Promise<AxiosResponse<TrendingTvShows>>[] = [];

	for (let i = 2; i < data.total_pages && i < limit && i < 1000; i++) {
		promises.push(
			new tmdbClient().get<PaginatedResponse<TvShow>>(`trending/tv/${window}`, {
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

export const tvVideos = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show Videos with id: ${id}`,
	});

	const params = {
		params: {
			language: 'en',
		},
	};

	const { data } = await new tmdbClient().get<TvVideos>(`tv/${id}/videos`, params);

	return data.results;
};

export const tvTranslations = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching TV Show Translations with id: ${id}`,
	});

	const { data } = await new tmdbClient().get<TvShowTranslations>(`tv/${id}/translations`);

	return data;
};
