import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { getAccessToken } from '../auth/helpers';

export interface AxiosInstance {
	request<T = any> (config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	delete<T = any, S = any>(url: string, data?: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	post<T = any, S = any>(url: string, data?: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	put<T = any, S = any>(url: string, data: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
	patch<T = any, S = any>(url: string, data: S, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

export default () => axios.create({
	headers: {
		Accept: 'application/json',
		Authorization: `Bearer ${globalThis.access_token ?? getAccessToken()}`,
	},
	baseURL: `https://api${process.env.ROUTE_SUFFIX ?? ''}.nomercy.tv/v1/`,
}) as AxiosInstance;
