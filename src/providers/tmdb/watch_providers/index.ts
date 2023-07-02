import tmdbApiClient from '../tmdbApiClient';
import { Regions } from './regions';
import { WatchProvider, WatchProviders } from '../shared';

export * from './movie';
export * from './regions';
export * from './tv';
export * from './watch_provider_helper';

export async function providers(): Promise<Array<WatchProvider>> {
	const data: Array<WatchProvider> = [];

	await Promise.all([
		watchProviderMovie().then((providers) => {
			for (const provider of providers) {
				data.push({
					...provider,
				});
			}
		}),
		watchProviderTv().then((providers) => {
			for (const provider of providers) {
				data.push({
					...provider,
				});
			}
		}),
	]);

	return data;
}

export const watchProviderMovie = async () => {
	const { data } = await tmdbApiClient.get<WatchProviders>('watch/providers/movie');

	return data.results;
};

export const watchProviderRegions = async () => {
	const { data } = await tmdbApiClient.get<Regions>('watch/providers/regions');

	return data.results;
};

export const watchProviderTv = async () => {
	const { data } = await tmdbApiClient.get<WatchProviders>('watch/providers/tv');

	return data.results;
};

export default {
	watchProviderMovie,
	watchProviderRegions,
	watchProviderTv,
};
