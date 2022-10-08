import tmdbApiClient from '../tmdbApiClient';
import i18next from 'i18next';
import { Configuration } from './configuration';
import { TimeZone } from './timeZone';
import { Language } from './language';
import { Country } from './country';
import { Job } from './job';

export const configuration = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<Configuration>('configuration', params);

	return data;
};

export const languages = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<Language[]>('configuration/languages', params);

	return data;
};

export const countries = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<Country[]>('configuration/countries', params);

	return data;
};

export const jobs = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<Job[]>('configuration/jobs', params);

	return data;
};

export const primaryTranslations = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<string[]>('configuration/primary_translations', params);

	return data;
};

export const timezones = async () => {
	const params = {
		params: {
			language: i18next.language,
		},
	};

	const { data } = await tmdbApiClient.get<TimeZone[]>('configuration/timezones', params);

	return data;
};
