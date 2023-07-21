import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';


const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
	config.params = {
		api_key: process.env.FANART_API_KEY,
		client_key: process.env.FANART_CLIENT_KEY == ''
			? undefined
			: process.env.FANART_CLIENT_KEY,
		...config.params,
	};

	config.headers = {
		'Accept': 'application/json',
	};

	config.timeout = 2000;

	return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
	// Logger.log({
	// 	level: 'error',
	// 	name: 'fanart',
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
	// 	name: 'fanart',
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

const fanartApiClient = setupInterceptorsTo(
	axios.create({
		baseURL: 'http://webservice.fanart.tv/v3',
	})
);

export default fanartApiClient;
