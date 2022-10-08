import { Movie } from '../movie';
import { MonetizationTypes } from '../watch_providers/watch_provider_helper';

export interface DiscoverMovie {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}

export enum DiscoverMovieSortOrder {
	'popularity.asc',
	'popularity.desc',
	'release_date.asc',
	'release_date.desc',
	'revenue.asc',
	'revenue.desc',
	'primary_release_date.asc',
	'primary_release_date.desc',
	'original_title.asc',
	'original_title.desc',
	'vote_average.asc',
	'vote_average.desc',
	'vote_count.asc',
	'vote_count.desc',
}

export interface DiscoverMovieParams {
	/**
	 * certification_country
	 ** Choose from one of the many available sort options. */
	sort_by?: DiscoverMovieSortOrder;

	/**
	 * certification_country
	 **  Used in conjunction with the certification filter, use this to specify a country with a valid certification.
	 */
	certification_country?: string;

	/**
	 * certification
	 **  Filter results with a valid certification from the 'certification_country' field.
	 */
	certification?: string;

	/**
	 * certification.lte
	 **  Filter and only include movies that have a certification that is less than or equal to the specified value.
	 */
	'certification.lte'?: string;

	/**
	 * certification.gte
	 **  Filter and only include movies that have a certification that is greater than or equal to the specified value.
	 */
	'certification.gte'?: string;

	/**
	 * include_video
	 **  A filter and include or exclude adult movies.
	 */
	include_adult?: boolean;

	/**
	 * include_video
	 **  A filter to include or exclude videos.
	 */
	include_video?: boolean;

	/**
	 * language
	 ** Specify a language to query translatable fields with.
	 */
	language?: string;

	/**
	 * page
	 **  Specify the page of results to query.
	 */
	page?: number;

	/**
	 * primary_release_year
	 **  A filter to limit the results to a specific primary release year.
	 */
	primary_release_year?: number;

	/**
	 * primary_release_date.gte
	 **  Filter and only include movies that have a primary release date that is greater or equal to the specified value.
	 */
	'primary_release_date.gte'?: Date;

	/**
	 * primary_release_date.lte
	 **  Filter and only include movies that have a primary release date that is less than or equal to the specified value.
	 */
	'primary_release_date.lte'?: Date;

	/**
	 * release_date.gte
	 **  Filter and only include movies that have a release date (looking at all release dates) that is greater or equal to the specified value.
	 */
	'release_date.gte'?: Date;

	/**
	 * release_date.lte
	 **  Filter and only include movies that have a release date (looking at all release dates) that is less than or equal to the specified value.
	 */
	'release_date.lte'?: Date;

	/**
	 * with_release_type
	 **  Specify a comma (AND) or pipe (OR) separated value to filter release types by. These release types map to the same values found on the movie release date method.
	 */
	with_release_type?: number;

	/**
	 * year
	 **  A filter to limit the results to a specific year (looking at all release dates).
	 */
	year?: number;

	/**
	 * vote_count.gte
	 **  Filter and only include movies that have a vote count that is greater or equal to the specified value.
	 */
	'vote_count.gte'?: number;

	/**
	 * vote_count.lte
	 **  Filter and only include movies that have a rating that is greater or equal to the specified value.
	 */
	'vote_count.lte'?: number;

	/**
	 * vote_average.gte
	 **  Filter and only include movies that have a rating that is less than or equal to the specified value.
	 */
	'vote_average.gte'?: number;

	/**
	 * "vote_average.lte
	 **  Filter and only include movies that have a rating that is less than or equal to the specified value.
	 */
	'vote_average.lte'?: number;

	/**
	 * with_cast
	 **  A comma separated list of person ID's. Only include movies that have one of the ID's added as an actor.
	 */
	with_cast?: boolean;

	/**
	 * with_crew
	 **  A comma separated list of person ID's. Only include movies that have one of the ID's added as a crew member.
	 */
	with_crew?: string;

	/**
	 * with_people
	 **  A comma separated list of person ID's. Only include movies that have one of the ID's added as a either a actor or a crew member.
	 */
	with_people?: string;

	/**
	 * with_companies
	 **  A comma separated list of production company ID's. Only include movies that have one of the ID's added as a production company.
	 */
	with_companies?: string;

	/**
	 * with_genres
	 **  Comma separated value of genre ids that you want to include in the results.
	 */
	with_genres?: string;

	/**
	 * without_genres
	 **  Comma separated value of genre ids that you want to exclude from the results.
	 */
	without_genres?: string;

	/**
	 * with_keywords
	 **  A comma separated list of keyword ID's. Only includes movies that have one of the ID's added as a keyword.
	 */
	with_keywords?: string;

	/**
	 * without_keywords
	 **  Exclude items with certain keywords. You can comma and pipe seperate these values to create an 'AND' or 'OR' logic.
	 */
	without_keywords?: string;

	/**
	 * with_runtime.gte
	 **  Filter and only include movies that have a runtime that is greater or equal to a value.
	 */
	'with_runtime.gte'?: number;

	/**
	 * with_runtime.lte
	 **  Filter and only include movies that have a runtime that is less than or equal to a value.
	 */
	'with_runtime.lte'?: number;

	/**
	 * with_original_language
	 **  Specify an ISO 639-1 string to filter results by their original language value.
	 */
	with_original_language?: string;

	/**
  * with_watch_providers
  **  A comma or pipe separated list of watch provider ID's. Combine this filter with `watch_region` in order to filter your results by a specific watch provider in
  a specific region.
    */
	with_watch_providers?: string;

	/**
	 * watch_region
	 **  An ISO 3166-1 code. Combine this filter with `with_watch_providers` in order to filter your results by a specific watch provider in a specific region.
	 */
	watch_region?: string;

	/**
	 * with_watch_monetization_types
	 **  In combination with `watch_region`, you can filter by monetization type.
	 */
	with_watch_monetization_types?: MonetizationTypes;

	/**
	 * without_companies
	 ** Filter the results to exclude the specific production companies you specify here. `AND` / `OR` filters are supported.
	 */
	without_companies?: string;
}
