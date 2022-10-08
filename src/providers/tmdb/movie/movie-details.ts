import { Company } from '../company/company';
import { Movie } from './movie';
import { MovieTranslations } from './translations';
import { Country, Genre, Language } from '../shared';
import { ExternalIDS } from './external_ids';
import { MovieWatchProviders } from './watch_providers';
import { PaginatedResponse } from '../helpers';
import { MovieCredits } from './movie_credits';
import { MovieImages } from './images';
import { MovieVideos } from './videos';
import { MovieKeywords } from './keywords';
import { AlternativeTitles } from '../tv';
import { MovieReleaseDates } from './release_dates';

export interface MovieDetails extends Movie {
	belongs_to_collection: BelongsToCollection | null;
	budget: number;
	genres: Genre[];
	homepage: string;
	imdb_id: string;
	production_companies: Company[];
	production_countries: Country[];
	revenue: number;
	runtime: number;
	spoken_languages: Language[];
	status: string;
	tagline: string;
	release_date: string;
}

export interface MovieAppend extends MovieDetails {
	alternative_titles: AlternativeTitles;
	credits: MovieCredits;
	external_ids: ExternalIDS;
	images: MovieImages;
	keywords: MovieKeywords;
	recommendations: PaginatedResponse<Movie>;
	similar: PaginatedResponse<Movie>;
	translations: MovieTranslations;
	videos: MovieVideos;
	release_dates: MovieReleaseDates;
	'watch/providers': MovieWatchProviders;
}

export interface BelongsToCollection {
	id: number;
	name: string;
    overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	parts: Array<Movie>;
}

export type MovieWithAppends<T extends keyof MovieAppend> = MovieDetails & Pick<MovieAppend, T>;
