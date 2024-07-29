/* eslint-disable no-loop-func */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Queue from 'queue-promise';
import promiseRetry from 'promise-retry';

import Connector from '../Http/Connector';

import i18next from 'i18next';
import Logger from '@server/functions/logger';
import { Movie } from '@server/providers/tmdb/movie';
import { TvDetails } from '@server/providers/tmdb/tv';
import { Person } from '@server/providers/tmdb/people';
import { PaginatedResponse } from '@server/providers/tmdb/helpers';
import { config } from '@server/functions/system';

interface TmdbClientConfig {
	language?: string;
	include_adult?: boolean;
}

/**
 * A client for making requests to The Movie Database (TMDb).
 */
class TmdbClient extends Connector {

	/**
	 * Object containing rate limit configuration for TmdbClient requests.
	 * @property {number} concurrent - The maximum number of concurrent requests allowed.
	 * @property {number} interval - The interval in milliseconds between each request.
	 * @property {boolean} start - Whether to start the rate limiting immediately.
	 */
	protected static rateLimit = {
		concurrent: 50,
		interval: 1000,
		start: true,
	};

	id: number = 0;
	language: string = '';
	include_adult: boolean = false;

	/**
	 * Creates a new instance of the TmdbClient class.
	 * @constructor
	 * @param {TmdbClientConfig} [options] - The configuration options for the TmdbClient.
	 * @param {string} [options.language] - The language to use for API requests. Defaults to app locale and country.
	 */
	constructor({ language = i18next.language }: TmdbClientConfig = {}) {
		super();

		this.language = language ?? `${config('app.locale')}-${config('app.country')}`;

		this.setHeaders({
			'Accept': 'application/json',
		});

		this.setToken(config('apiKeys.TMDB_API_TOKEN'));

		this.setBaseUrl('https://api.themoviedb.org/3');

		this.setParams({
			include_adult: this.include_adult,
			language: language,
		});
	}

	/**
	 * Enqueues a function that returns a Promise to be executed in a queue.
	 * @param func The function to be executed in the queue.
	 * @returns A Promise that resolves with the result of the function.
	 */
	public static enqueue<T>(func: () => Promise<T>): Promise<T> {
		const queue = TmdbClient.getQueue();
		const key = `${TmdbClient.name}_${Math.random()
			.toString(36)
			.substring(3)}`;

		return promiseRetry<T>((retry) => {
			queue.enqueue(async () => {
				return {
					key: key,
					data: await func(),
				};
			});

			return new Promise((resolve) => {
				queue.on('resolve', (result) => {
					if (result.key && key === result.key) {
						return resolve(result.data);
					}
				});
				queue.on('reject', (result) => {
					if (result.key && key === result.key) {
						return retry(result.data);
					}
				});
			});
		})
			.then((value) => {
				return value;
			}, (err) => {
				this.error(err);
				// TODO: store error in database ${number}
				return Promise.reject(err);
			});
	}

	/**
	 * Returns the maximum number of items that can be retrieved based on the available items, the desired number of items, and a constraint.
	 * @param available The total number of items available.
	 * @param wanted The desired number of items.
	 * @param constraint The maximum number of items that can be retrieved.
	 * @returns The maximum number of items that can be retrieved.
	 */
	public static max(available: number, wanted: number, constraint: number): number {
		return wanted < available
			?			wanted > constraint
				?				constraint
				:				wanted
			:			available;
	}

	/**
	 * Returns the queue used for rate limiting requests to the TMDB API.
	 * If the queue does not exist, it will be created with the rate limit specified in TmdbClient.rateLimit.
	 * @returns The queue used for rate limiting requests to the TMDB API.
	 */
	protected static getQueue() {
		if (!TmdbClient.queue) {
			TmdbClient.queue = new Queue(TmdbClient.rateLimit);
		}
		return TmdbClient.queue;
	}

	/**
	 * Logs an info message with the specified message.
	 * @param message - The message to log.
	 */
	protected static info(message: string) {
		Logger.log({
			level: 'info',
			name: 'moviedb',
			color: 'blue',
			message: message,
		});
	}

	/**
	 * Logs a verbose message to the console.
	 * @param message - The message to log.
	 */
	protected static verbose(message: string) {
		Logger.log({
			level: 'verbose',
			name: 'moviedb',
			color: 'blue',
			message: message,
		});
	}

	/**
	 * Logs a debug message to the console using the `moviedb` logger with blue color.
	 * @param message - The message to log.
	 */
	protected static debug(message: string) {
		Logger.log({
			level: 'debug',
			name: 'moviedb',
			color: 'blue',
			message: message,
		});
	}

	/**
	 * Logs an error message using the moviedb logger.
	 * @param message - The error message to log.
	 */
	protected static error(message: string) {
		Logger.log({
			level: 'error',
			name: 'moviedb',
			color: 'red',
			message: message,
		});
	}

	/**
	 * Returns a paginated response of type T[] for the given instance and function name.
	 * @template I - The instance type.
	 * @template T - The response type.
	 * @param {I} instance - The instance to call the function on.
	 * @param {string} func - The name of the function to call.
	 * @param {number} limit - The maximum number of pages to return.
	 * @param {...any} args - The arguments to pass to the function.
	 * @returns {Promise<T[]>} - A promise that resolves to an array of type T[].
	 */
	protected static paginatedResponse<I, T = Movie | TvDetails | Person>(instance: I, func: string, limit: number, ...args: any): Promise<T[]> {

		const arg = args.reduce((result: any, current: any) => {
			return Object.assign(result, current);
		}, { limit: limit });

		return new Promise(async (resolve, reject) => {
			const arr: T[] = [];

			const res = await instance[func]({ page: 1, ...arg }) as PaginatedResponse<T>;
			arr.push(...res.results);

			let jobs = TmdbClient.max(res.total_pages, limit, 500);

			for (let i = 1; i < res.total_pages && i < limit && i <= 500; i += 1) {
				instance[func]({ page: i, ...arg })
					.then((res: { results: any; }) => {
						arr.push(...res.results);
						jobs -= 1;
					})
					.catch((err: any) => {
						reject(err);
					})
					.finally(() => {
						if (jobs === 1) {
							resolve(arr);
						}
					});
			}
		});
	}

	/**
	 * Sends a GET request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	async get<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.get<T>(url, params));
	}

	/**
	 * Sends a POST request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	protected async post<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.post<T>(url, params));
	}

	/**
	 * Sends a PUT request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	protected async put<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.put<T>(url, params));
	}

	/**
	 * Sends a DELETE request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	protected async delete<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.delete<T>(url, params));
	}

	/**
	 * Sends a PATCH request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	protected async patch<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.patch<T>(url, params));
	}

	/**
	 * Sends a HEAD request to the specified URL with optional parameters.
	 * @param url - The URL to send the request to.
	 * @param params - Optional parameters to include in the request.
	 * @returns A Promise that resolves with the AxiosResponse object containing the response data.
	 */
	protected async head<T>(url: string, params?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<T, any>> {
		return await TmdbClient.enqueue(() => this.axios.head<T>(url, params));
	}
}

export default TmdbClient;
