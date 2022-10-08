// import i18next from '../../loaders/i18n';
// import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// import https from 'https';
// import { AppState, useSelector } from '../../state/redux';

// const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
// 	const accessToken = useSelector((state: AppState) => state.user.access_token);

// 	config = {
// 		...config,
// 		headers: {
// 			Accept: 'application/json',
// 			'Accept-Language': `${i18next.language || 'en'}`,
// 			Authorization: `Bearer ${accessToken}`,
// 		},
// 	};
// 	return config;
// };

// const onRequestError = (error: AxiosError): Promise<AxiosError> => {
// 	return Promise.reject(error);
// };

// const onResponse = (response: AxiosResponse<any>): AxiosResponse => {
// 	return response;
// };

// const onResponseError = (error: AxiosError): Promise<AxiosError> => {
// 	return Promise.reject(error);
// };

// export const setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
// 	axiosInstance.interceptors.request.use(onRequest, onRequestError);
// 	axiosInstance.interceptors.response.use(onResponse, onResponseError);
// 	return axiosInstance;
// };

// const appApiClient = setupInterceptorsTo(
// 	axios.create({
// 		httpsAgent: new https.Agent({ rejectUnauthorized: false }),
// 		timeout: parseInt(process.env.REQUEST_TIMEOUT || '1000', 10),
// 	})
// );

// export default appApiClient;

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { store } from '../../state/redux';

export interface AxiosInstance {
	request<T = any> (config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	delete<T = any, S = any>(url: string, data?: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	post<T = any, S = any>(url: string, data?: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	put<T = any, S = any>(url: string, data: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	patch<T = any, S = any>(url: string, data: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

export default (() => axios.create({
	headers: {
		Accept: "application/json",
		Authorization: `Bearer ${store.getState().user.access_token}`,
	},
	baseURL: "https://api.nomercy.tv/",
}) as AxiosInstance);
