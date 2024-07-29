import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { rateLimitOptions } from 'axios-rate-limit';
import { config, serverVersion } from '@server/functions/system';
import Logger from '@server/functions/logger';


export type Method = keyof typeof MethodEnum;

export enum MethodEnum {
	all = 'all',
	get = 'get',
	post = 'post',
	put = 'put',
	delete = 'delete',
	patch = 'patch',
	options = 'options',
	head = 'head',
}

class BaseRequest {
	protected method: string = MethodEnum.get;
	protected baseUrl: string = '';
	protected url: string = '';
	protected headers: { [key: string]: string | number | boolean | undefined; } = {};
	protected body: unknown = {};
	protected query: { [key: string]: unknown; } = {};
	protected params: { [key: string]: unknown; } = {};
	protected axios: AxiosInstance = axios;
	protected timeout: number = 5000;
	protected rateLimit: rateLimitOptions = {
		maxRequests: 1,
		perMilliseconds: 5000,
		maxRPS: 1,
	};

	protected defaultHeaders(): { [key: string]: string; } {
		return {
			'User-Agent': `NoMercy-Media-Server/${serverVersion()}`,
		};
	}

	protected withBaseUrl(baseUrl: string): this {
		this.baseUrl = baseUrl;

		this.axios = this.setupInterceptorsTo(
			axios.create({
				baseURL: baseUrl,
				headers: {
					Authorization: `Bearer ${config('apiKeys.TMDB_API_TOKEN')}`,
				},
			})
		);
		return this;
	}

	protected withBody(body: unknown): this {
		this.body = body;
		return this;
	}

	protected withHeaders(headers: { [key: string]: string | number | boolean | undefined; }): this {
		this.headers = { ...this.defaultHeaders(), ...this.headers, ...headers };
		return this;
	}

	protected withParams(params: { [key: string]: string | number | boolean | undefined; }): this {
		this.params = { ...this.params, ...params };
		return this;
	}

	protected withQuery(query: { [key: string]: string | number | boolean | undefined; }): this {
		this.query = { ...this.query, ...query };
		return this;
	}

	protected withToken(token: string): this {
		this.headers.Authorization = `Bearer ${token}`;
		return this;
	}

	private setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
		axiosInstance.interceptors.request.use(this.onRequest.bind(this) as never, this.onRequestError.bind(this));
		axiosInstance.interceptors.response.use(this.onResponse.bind(this), this.onResponseError.bind(this));
		return axiosInstance;
	};

	private onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
		config.params = { ...this.params, ...config.params };
		config.headers = { ...this.headers, ...config.headers };

		config.timeout = this.timeout;

		return config;
	};

	private onRequestError(error: AxiosError): Promise<AxiosError> {
		Logger.log({
			level: 'error',
			name: 'moviedb',
			color: 'red',
			message: JSON.stringify(error, null, 2),
		});

		return Promise.reject(error);
	};

	private onResponse(response: AxiosResponse<unknown>): AxiosResponse {
		// console.info(response);

		return response;
	};

	private onResponseError(error: AxiosError): Promise<AxiosError> {
		Logger.log({
			level: 'error',
			name: 'moviedb',
			color: 'red',
			message: JSON.stringify(error, null, 2),
		});

		return Promise.reject(error);
	};

	// protected get(url: string): this {

	//     this.method = MethodEnum.get;
	//     this.url = url;
	//     return this;
	// }

	// protected post(url: string): this {
	//     this.method = MethodEnum.post;
	//     this.url = url;
	//     return this;
	// }

	// protected put(url: string): this {
	//     this.method = MethodEnum.put;
	//     this.url = url;
	//     return this;
	// }

	// protected patch(url: string): this {
	//     this.method = MethodEnum.patch;
	//     this.url = url;
	//     return this;
	// }

	// protected delete(url: string): this {
	//     this.method = MethodEnum.delete;
	//     this.url = url;
	//     return this;
	// }

	// protected head(url: string): this {
	//     this.method = MethodEnum.head;
	//     this.url = url;
	//     return this;
	// }

	// protected options(url: string): this {
	//     this.method = MethodEnum.options;
	//     this.url = url;
	//     return this;
	// }
}

export default BaseRequest;
