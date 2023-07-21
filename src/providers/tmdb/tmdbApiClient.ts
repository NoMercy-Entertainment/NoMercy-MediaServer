import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import Logger from '@server/functions/logger';
import i18next from 'i18next';

const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
	config.params = {
		api_key: process.env.TMDB_API_KEY,
		language: i18next.language || process.env.LANGUAGE,
		...config.params,
		include_adult: false,
	};

	config.headers = {
		'Accept': 'application/json',
	};

	config.timeout = 20000;

	return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
	Logger.log({
		level: 'error',
		name: 'moviedb',
		color: 'red',
		message: JSON.stringify(error, null, 2),
	});

	return Promise.reject(error);
};

const onResponse = (response: AxiosResponse<any>): AxiosResponse => {
	// console.info(response);

	return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
	Logger.log({
		level: 'error',
		name: 'moviedb',
		color: 'red',
		message: JSON.stringify(error, null, 2),
	});

	return Promise.reject(error);
};

export const setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
	axiosInstance.interceptors.request.use(onRequest as never, onRequestError);
	axiosInstance.interceptors.response.use(onResponse, onResponseError);
	return axiosInstance;
};

const tmdbApiClient = setupInterceptorsTo(
	axios.create({
		baseURL: 'https://api.themoviedb.org/3',
	})
);

export default tmdbApiClient;
