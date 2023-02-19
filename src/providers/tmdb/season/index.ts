import { AxiosResponse } from 'axios';
import Logger from '../../../functions/logger';
import { SeasonChanges } from './changes';
import { SeasonImages } from './images';
import { SeasonTranslations } from './translations';
import { SeasonWithAppends } from './season-details';
import i18next from 'i18next';
import moment from 'moment';
import tmdbApiClient from '../tmdbApiClient';

export * from './account_states';
export * from './aggregate_credits';
export * from './changes';
export * from './season-credits';
export * from './external_ids';
export * from './images';
export * from './season';
export * from './season-details';
export * from './top_rated';
export * from './translations';
export * from './videos';

export const seasonAppend = ['aggregate_credits', 'credits', 'external_ids', 'images', 'translations'] as const;

export const season = async (id: number, season: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Season with TV id: ${id} and Season number ${season}`,
	});
	const params = {
		params: {
			append_to_response: seasonAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<SeasonWithAppends<typeof seasonAppend[number]>>(`tv/${id}/season/${season}`, params);
	return data;
};

export const seasonChanges = async (id: number, season: number, daysback = 1) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Season Changes with TV id: ${id} and Season number ${season}`,
	});
	const params = {
		params: {
			start_date: moment().subtract(daysback, 'days')
				.format('md'),
			end_date: moment().format('md'),
		},
	};

	const { data } = await tmdbApiClient.get<SeasonChanges>(`tv/${id}/season/${season}/changes`, params);

	return data;
};

export const seasons = async (id: number, seasons: number[] = []) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Combined Seasons with TV id: ${id} and`,
	});

	const append = ['aggregate_credits', 'credits', 'external_ids', 'images', 'translations'] as const;

	const arr: SeasonWithAppends<typeof append[number]>[] = [];

	const params = {
		params: {
			append_to_response: append.join(','),
		},
	};

	const promises: Promise<AxiosResponse<SeasonWithAppends<typeof append[number]>>>[] = [];

	for (let i = 0; i < seasons.length; i++) {
		promises.push(tmdbApiClient.get<SeasonWithAppends<typeof append[number]>>(`tv/${id}/season/${seasons[i]}`, params));
	}

	const data = await Promise.all(promises);

	for (let g = 0; g < data.length; g++) {
		arr.push(data[g].data);
	}

	return arr;
};

export const seasonImages = async (id: number, season: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Season Images with TV id: ${id} and Season number ${season}`,
	});

	const params = {
		params: {
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<SeasonImages>(`tv/${id}/season/${season}/images`, params);

	return data;
};

export const seasonTranslations = async (id: number, season: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Season translations with TV id: ${id} and Season number ${season}`,
	});

	const { data } = await tmdbApiClient.get<SeasonTranslations>(`tv/${id}/season/${season}/translations`);

	return data;
};
