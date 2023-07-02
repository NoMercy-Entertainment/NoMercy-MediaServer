import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface FanartApiOptions {
	apiKey?: string;
	proxyUrl?: string;
	mock?: boolean;
}

const createAxios = ({ apiKey, proxyUrl, mock }: FanartApiOptions) => {
	if (mock) return axios.create();
	if (proxyUrl) return axios.create({ baseURL: proxyUrl });
	// eslint-disable-next-line no-throw-literal
	if (!apiKey) throw 'API key not provided';

	return axios.create({
		baseURL: 'http://webservice.fanart.tv/v3',
		params: { api_key: apiKey },
	});
};

/**
 * API class for fanart, includes get, post, patch, delete, etc...
 */
export class Api {
	axios: AxiosInstance;
	isMocked: boolean;

	constructor(options: FanartApiOptions) {
		this.axios = createAxios(options);
		this.isMocked = !!options?.mock;
	}

	get<T>(uri: string, params: Record<string, unknown>): Promise<AxiosResponse<T>> {
		return this.axios.get<T>(uri, params);
	}
}
