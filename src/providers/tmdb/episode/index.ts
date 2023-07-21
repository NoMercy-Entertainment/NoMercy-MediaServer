import { AxiosResponse } from 'axios';
import { EpisodeChanges } from './changes';
import { EpisodeImages } from './images';
import { EpisodeTranslations } from './translations';
import { EpisodeWithAppends } from './episode-details';
import Logger from '@server/functions/logger';
import i18next from 'i18next';
import moment from 'moment';
import tmdbApiClient from '../tmdbApiClient';

export * from './account_states';
export * from './changes';
export * from './episode-credits';
export * from './episode';
export * from './episode-details';
export * from './episode_groups';
export * from './external_ids';
export * from './images';
export * from './translations';
export * from './videos';

export const episodeAppend = ['credits', 'external_ids', 'images', 'translations', 'crew', 'guest_stars', 'changes'] as const;

export const episode = async (id: number, season: number, episode: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Episode with TV id: ${id} and Season number ${season} and Episode number ${episode}`,
	});
	const params = {
		params: {
			append_to_response: episodeAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<EpisodeWithAppends<typeof episodeAppend[number]>>(
		`tv/${id}/season/${season}/episode/${episode}`,
		params
	);

	// data.credits.crew[0].name
	return data;
};

export const episodeChanges = async (id: number, season: number, episode: number, daysback = 1) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Season Changes with TV id: ${id} and Season number ${season} and Episode number ${episode}`,
	});

	const params = {
		params: {
			start_date: moment().subtract(daysback, 'days')
				.format('md'),
			end_date: moment().format('md'),
		},
	};

	const { data } = await tmdbApiClient.get<EpisodeChanges>(`tv/${id}/season/${season}/episode/${episode}/changes`, params);

	return data;
};

export const episodes = async (id: number, season: number, episodes: number[] = []) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Combined Episodes with TV id: ${id} and Season number ${season}`,
	});

	const promises: Promise<AxiosResponse<EpisodeWithAppends<typeof episodeAppend[number]>>>[] = [];

	for (let i = 0; i < episodes.length; i++) {
		const params = {
			params: {
				append_to_response: episodeAppend.join(','),
			},
		};

		promises.push(tmdbApiClient.get<EpisodeWithAppends<typeof episodeAppend[number]>>(`tv/${id}/season/${season}/episode/${episodes[i]}`, params));
	}

	const arr: EpisodeWithAppends<typeof episodeAppend[number]>[] = [];
	const data = await Promise.all(promises);

	for (let g = 0; g < data.length; g++) {
		arr.push(data[g].data);
	}

	return arr;
};

export const episodeImages = async (id: number, season: number, episode: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Episode Images with TV id: ${id} and Season number ${season} and Episode number ${episode}`,
	});

	const params = {
		params: {
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<EpisodeImages>(`tv/${id}/season/${season}/episode/${episode}/images`, params);

	return data;
};

export const seasonTranslations = async (id: number, season: number, episode: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Episode Translations with TV id: ${id} and Season number ${season} and Episode number ${episode}`,
	});

	const { data } = await tmdbApiClient.get<EpisodeTranslations>(`tv/${id}/season/${season}/episode/${episode}/translations`);

	return data;
};
