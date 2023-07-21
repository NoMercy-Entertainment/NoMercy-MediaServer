import {
	AggregateCredit,
	AggregateCredits,
	Cast,
	Country,
	CreatedBy,
	Crew,
	Genre,
	Language
} from '@server/providers/tmdb/shared/index';
import {
	AlternativeTitles,
	ExternalIDS,
	Recommendations,
	TvCast,
	TvContentRatings,
	TvCredits,
	TvCrew,
	TvImages,
	TvKeywords,
	TvShowTranslations,
	TvSimilar,
	TvVideos,
	TvWatchProviders,
	tv
} from '@server/providers/tmdb/tv/index';
import { Episode, EpisodeAppend, episodes } from '@server/providers/tmdb/episode/index';
import { PersonAppend, person } from '@server/providers/tmdb/people/index';
import { SeasonAppend, seasons } from '@server/providers/tmdb/season/index';
import { chunk, jsonToString, unique } from '@server/functions/stringArray';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { Company } from '@server/providers/tmdb/company/company';
import { Network } from '@server/providers/tmdb/networks/network';
import { cachePath } from '@server/state';
import { fileChangedAgo } from '@server/functions/dateTime';
import path from 'path';

export default (id: number) => {
	return new Promise<CompleteTvAggregate>((resolve, reject) => {

		try {
			const showFile = path.resolve(cachePath, 'temp', `tv_${id}.json`);

			if (existsSync(showFile) && fileChangedAgo(showFile, 'days') < 50) {
				try {
					const data = JSON.parse(readFileSync(showFile, 'utf-8')) as CompleteTvAggregate;
					return resolve(data);
				} catch (error) {
					return reject(error);
				}
			}

			tv(id).then(async (show) => {

				const people: Array<TvCast | TvCrew | Cast | Crew | PersonAppend | AggregateCredit> = [];
				const newCast: Array<any> = [];
				const newCrew: Array<any> = [];
				const personPromise: Array<any> = [];

				// @ts-expect-error
				const data: CompleteTvAggregate = {
					...show,
				};
				data.seasons = [];

				await seasons(
					show.id,
					show.seasons.map(s => s.season_number)
				).then(async (Seasons) => {

					data.seasons.push(...Seasons.map(s => ({ ...s, episodes: [] })));

					for (let i = 0; i < Seasons.length; i++) {
						const Season = Seasons[i];

						Season.credits.cast.map(c => people.push(c));
						Season.credits.crew.map(c => people.push(c));

						await episodes(show.id, Season.season_number, Season.episodes.map(e => e.episode_number))
							.then((Episodes) => {

								(data.seasons.find(s => s.season_number == Season.season_number) as SeasonAppend).episodes.push(...Episodes);

								for (let j = 0; j < Episodes.length; j++) {
									const Episode = Episodes[j];

									Episode.credits.cast.map(c => people.push(c));
									Episode.credits.crew.map(c => people.push(c));
								}
							})
							.catch(() => {
								//
							});
					}
				});

				data.aggregate_credits.cast.map(c => people.push(c));
				data.aggregate_credits.crew.map(c => people.push(c));

				for (const Person of unique(people, 'id')) {
					personPromise.push(
						await person(Person.id).then((p) => {
							data.aggregate_credits.cast
								.filter(c => c.id == p.id)
								.map((c) => {
									newCast.push({
										...c,
										...p,
									});
								});

							data.aggregate_credits.crew
								.filter(c => c.id == p.id)
								.map((c) => {
									newCrew.push({
										...c,
										...p,
									});
								});
						})
					);
				}

				const promiseChunks = chunk(personPromise, 500);
				for (const promise of promiseChunks) {
					await Promise.all(promise);
				}
				data.people = [];

				data.people.push(...newCast);
				data.people.push(...newCrew);

				data.people = unique(data.people, 'id');

				writeFileSync(showFile, jsonToString(data));
				resolve(data);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export interface CompleteCast extends PersonAppend, TvCast {}
export interface CompleteCrew extends PersonAppend, TvCrew {}

export interface CompleteTvAggregate {
	adult?: boolean | undefined;
	backdrop_path: string | null;
	created_by: CreatedBy[];
	episode_run_time: number[];
	first_air_date: string;
	genres: Genre[];
	homepage: string;
	id: number;
	in_production: boolean;
	languages: string[];
	last_air_date: string;
	last_episode_to_air: Episode | null;
	name: string;
	next_episode_to_air: Episode | null;
	networks: Network[];
	number_of_episodes: number;
	number_of_seasons: number;
	origin_country: string[];
	original_language: string;
	original_name: string;
	overview: string;
	popularity: number;
	poster_path: string | null;
	production_companies: Company[];
	production_countries: Country[];
	seasons: CombinedSeasons[];
	spoken_languages: Language[];
	status: string;
	tagline: string;
	type: string;
	vote_average: number;
	vote_count: number;
	aggregate_credits: AggregateCredits;
	people: CombinedPeople;
	credits: TvCredits;
	keywords: TvKeywords;
	alternative_titles: AlternativeTitles;
	images: TvImages;
	recommendations: Recommendations;
	videos: TvVideos;
	'watch/providers': TvWatchProviders;
	content_ratings: TvContentRatings;
	external_ids: ExternalIDS;
	similar: TvSimilar;
	translations: TvShowTranslations;
}

export type CombinedPeople = Array<CompleteCast | CompleteCrew>

export interface CombinedSeasons extends SeasonAppend {
	episodes: EpisodeAppend[];
}
