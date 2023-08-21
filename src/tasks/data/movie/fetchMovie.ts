import {
	BelongsToCollection,
	ExternalIDS,
	MovieAlternativeTitles,
	MovieCast,
	MovieCredits,
	MovieCrew,
	MovieImages,
	MovieKeywords,
	MovieRecommendations,
	MovieReleaseDates,
	MovieSimilar,
	MovieTranslations,
	MovieVideos,
	MovieWatchProviders,
	movie
} from '../../../providers/tmdb/movie/index';
import { Cast, Country, Crew, Genre, Language } from '../../../providers/tmdb/shared/index';
import { PersonAppend, person } from '../../../providers/tmdb/people/index';
import { chunk, jsonToString, unique } from '@server/functions/stringArray';
import collection, { CollectionAppend } from '../../../providers/tmdb/collection/index';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { Company } from '../../../providers/tmdb/company/company';
import { cachePath } from '@server/state';
import { fileChangedAgo } from '@server/functions/dateTime';
import path from 'path';

export default (id: number) => {
	return new Promise<CompleteMovieAggregate>((resolve, reject) => {

		try {
			const movieFile = path.resolve(cachePath, 'temp', `movie_${id}.json`);

			if (existsSync(movieFile) && fileChangedAgo(movieFile, 'days') < 50) {
				try {
					const data = JSON.parse(readFileSync(movieFile, 'utf-8')) as CompleteMovieAggregate;
					return resolve(data);
				} catch (error) {
					return reject(error);
				}
			}

			movie(id).then(async (movie) => {

				const people: Array<MovieCast | MovieCrew | Cast | Crew | PersonAppend> = [];
				const personPromise: Array<any> = [];

				// @ts-expect-error
				const data: CompleteMovieAggregate = {
					...movie,
				};

				if (movie.belongs_to_collection) {
					data.collection = await collection(movie.belongs_to_collection.id);
				}

				data.credits.cast.map(c => people.push(c));
				data.credits.crew.map(c => people.push(c));

				const newPeople: Array<any> = [];

				for (const Pers of unique(people, 'id')) {
					personPromise.push(
						await person(Pers.id).then((p) => {
							newPeople.push(p);
						})
					);
				}

				const promiseChunks = chunk(personPromise, 500);
				for (const promise of promiseChunks) {
					await Promise.all(promise);
				}
				data.people = [];

				data.people.push(...newPeople);

				data.people = unique(data.people, 'id');

				writeFileSync(movieFile, jsonToString(data));
				resolve(data);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export interface CompleteCast extends PersonAppend, MovieCast {}
export interface CompleteCrew extends PersonAppend, MovieCrew {}
export type CompleteCollection = CollectionAppend

export interface CompleteMovieAggregate {
    adult: boolean;
    backdrop_path: string;
    belongs_to_collection: BelongsToCollection;
    budget: number;
    genres: Genre[];
    homepage: string;
    id: number;
    imdb_id: string;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: Company[];
    production_countries: Country[];
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: Language[];
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    alternative_titles: MovieAlternativeTitles;
    credits: MovieCredits;
    recommendations: MovieRecommendations;
    external_ids: ExternalIDS;
    videos: MovieVideos;
    images: MovieImages;
    similar: MovieSimilar;
    'watch/providers': MovieWatchProviders;
    keywords: MovieKeywords;
    release_dates: MovieReleaseDates;
    translations: MovieTranslations;
    people: CombinedPeople;
    collection: CompleteCollection;
}

export type CombinedPeople = Array<CompleteCast | CompleteCrew>
