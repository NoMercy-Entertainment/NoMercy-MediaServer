import tmdbApiClient from '../tmdbApiClient';
import { Regions } from './regions';
import { TvWatchProviders } from '../tv';

export * from './movie';
export * from './regions';
export * from './tv';
export * from './watch_provider_helper';

export const watchProviderMovie = async () => {
	const { data } = await tmdbApiClient.get<TvWatchProviders>('watch/providers/movie');

	return data.results;
};

export const watchProviderRegions = async () => {
	const { data } = await tmdbApiClient.get<Regions>('watch/providers/regions');

	return data.results;
};

export const watchProviderTv = async () => {
	const { data } = await tmdbApiClient.get<TvWatchProviders>('watch/providers/tv');

	return data.results;
};

export default {
	watchProviderMovie,
	watchProviderRegions,
	watchProviderTv,
};
