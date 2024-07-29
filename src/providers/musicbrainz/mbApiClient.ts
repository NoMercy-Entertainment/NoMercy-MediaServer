import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';


const onRequest = (config: AxiosRequestConfig) => {
	config.params = {
		fmt: 'json',
		...config.params,
	};

	config.headers = {
		'User-Agent': 'NoMercy MediaServer',
	};

	config.timeout = 2000;

	return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
	// Logger.log({
	// 	level: 'error',
	// 	name: 'musicBrainz',
	// 	color: 'red',
	// 	message: JSON.stringify(error, null, 2),
	// });

	return Promise.reject(error);
};

const onResponse = (response: AxiosResponse<any>): AxiosResponse => {
	// console.info(response);

	return response;
};

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
	// Logger.log({
	// 	level: 'error',
	// 	name: 'musicBrainz',
	// 	color: 'red',
	// 	message: JSON.stringify(error, null, 2),
	// });

	return Promise.reject(error);
};

export const setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
	axiosInstance.interceptors.request.use(onRequest as never, onRequestError);
	axiosInstance.interceptors.response.use(onResponse, onResponseError);
	return axiosInstance;
};

const mbApiClient = setupInterceptorsTo(
	axios.create({
		baseURL: 'https://musicbrainz.org/ws/2/',
		headers: {
			'User-Agent': 'NoMercy MediaServer',
		},
	})
);

axiosRetry(mbApiClient, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
});

export default mbApiClient;
