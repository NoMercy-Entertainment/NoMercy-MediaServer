import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface TmdbApiOptions {
	apiKey?: string;
	proxyUrl?: string;
	mock?: boolean;
}

const createAxios = ({ apiKey, proxyUrl, mock }: TmdbApiOptions) => {
	if (mock) return axios.create();
	if (proxyUrl) return axios.create({ baseURL: proxyUrl });
	// eslint-disable-next-line no-throw-literal
	if (!apiKey) throw 'API key not provided';

	return axios.create({
		baseURL: 'https://api.themoviedb.org/3',
		params: { api_key: apiKey },
	});
};

/**
 * API class for tmdb, includes get, post, patch, delete, etc...
 */
export class Api {
	axios: AxiosInstance;
	isMocked: boolean;

	constructor(options: TmdbApiOptions) {
		this.axios = createAxios(options);
		this.isMocked = !!options?.mock;
	}

	async get<T>(uri: string, params: Record<string, unknown>): Promise<AxiosResponse<T>> {
		return this.axios.get<T>(uri, params);
	}
}
