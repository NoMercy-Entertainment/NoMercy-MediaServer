import { TvShow } from '../tv';
import { MonetizationTypes, StatusTypes, TvShowTypes } from '../watch_providers/watch_provider_helper';

export interface DiscoverTvShow {
	page: number;
	results: TvShow[];
	total_pages: number;
	total_results: number;
}

export enum DiscoverTvShowSortOrder {
	'vote_average.desc',
	'vote_average.asc',
	'first_air_date.desc',
	'first_air_date.asc',
	'popularity.desc',
	'popularity.asc',
}

export interface DiscoverTvShowParams {

	/**
	 * sort_by
	 ** Choose from one of the many available sort options.
	 */
	sort_by?: DiscoverTvShowSortOrder;

	/**
	 * first_air_date.gte
	 ** Filter and only include TV shows that have a original air date that is greater or equal to the specified value. Can be used in conjunction with the \"include_null_first_air_dates\" filter if you want to include items with no air date.
	 */
	'air_date.gte'?: string;

	/**
	 * air_date.lte
	 ** Filter and only include TV shows that have a air date (by looking at all episodes) that is less than or equal to the specified value.
	 */
	'air_date.lte'?: string;

	/**
	 * first_air_date.lte
	 ** Filter and only include TV shows that have a air date (by looking at all episodes) that is less than or equal to the specified value.
	 */
	'first_air_date.gte'?: string;

	/**
	 * first_air_date.gte
	 ** Filter and only include TV shows that have a original air date that is greater or equal to the specified value. Can be used in conjunction with the \"include_null_first_air_dates\" filter if you want to include items with no air date.
	 */
	'first_air_date.lte'?: string;

	/**
	 * first_air_date.lte
	 ** Filter and only include TV shows that have a original air date that is less than or equal to the specified value. Can be used in conjunction with the \"include_null_first_air_dates\" filter if you want to include items with no air date.
	 */
	first_air_date_year?: number;

	/**
	 * language
	 ** Specify a language to query translatable fields with.
	 */
	language?: any;

	/**
	 * page
	 ** Specify the page of results to query.
	 */
	page?: number;

	/**
	 * timezone
	 ** Used in conjunction with the air_date.gte/lte filter to calculate the proper UTC offset.
	 */
	timezone?: string;

	/**
	 * vote_average.gte
	 ** Filter and only include movies that have a rating that is greater or equal to the specified value.
	 */
	'vote_average.gte'?: number;

	/**
	 * vote_count.gte
	 ** Filter and only include movies that have a rating that is less than or equal to the specified value.
	 */
	'vote_count.gte'?: number;

	/**
	 * with_genres
	 ** Comma separated value of genre ids that you want to include in the results.
	 */
	with_genres?: string;

	/**
	 * with_networks
	 ** Comma separated value of network ids that you want to include in the results.
	 */
	with_networks?: string;

	/**
	 * without_genres
	 ** Comma separated value of genre ids that you want to exclude from the results.
	 */
	without_genres?: string;

	/**
	 * with_runtime.gte
	 ** Filter and only include TV shows with an episode runtime that is greater than or equal to a value.
	 */
	'with_runtime.gte'?: number;

	/**
	 * with_runtime.lte
	 ** Filter and only include TV shows with an episode runtime that is less than or equal to a value.
	 */
	'with_runtime.lte'?: number;

	/**
	 * include_null_first_air_dates
	 ** Use this filter to include TV shows that don't have an air date while using any of the \"first_air_date\" filters.
	 */
	include_null_first_air_dates?: boolean;

	/**
	 * with_original_language
	 ** Specify an ISO 639-1 string to filter results by their original language value.
	 */
	with_original_language?: string;

	/**
	 * without_keywords
	 ** Exclude items with certain keywords. You can comma and pipe seperate these values to create an 'AND' or 'OR' logic.
	 */
	without_keywords?: string;

	/**
	 * screened_theatrically
	 ** Filter results to include items that have been screened theatrically.
	 */
	screened_theatrically?: boolean;

	/**
	 * with_companies
	 ** A comma separated list of production company ID's. Only include movies that have one of the ID's added as a production company.
	 */
	with_companies?: string;

	/**
	 * with_keywords
	 ** A comma separated list of keyword ID's. Only includes TV shows that have one of the ID's added as a keyword.
	 */
	with_keywords?: string;

	/**
	 * with_watch_providers
	 ** A comma or pipe separated list of watch provider ID's. Combine this filter with `watch_region` in order to filter your results by a specific watch provider in a specific region.
	 */
	with_watch_providers?: string;

	/**
	 * watch_region
	 ** An ISO 3166-1 code. Combine this filter with `with_watch_providers` in order to filter your results by a specific watch provider in a specific region.
	 */
	watch_region?: string;

	/**
	 * with_watch_monetization_types
	 ** In combination with `watch_region`, you can filter by monetization type.
	 */
	with_watch_monetization_types?: MonetizationTypes;

	/**
   * with_status
   ** Filter TV shows by their status.
    - Returning Series: 0
    - Planned: 1
    - In Production: 2
    - Ended: 3
    - Cancelled: 4
    - Pilot: 5
   */
	with_status?: StatusTypes;

	/**
   * with_type
   ** Filter TV shows by their type.
   - -Documentary 0
   - -News 1
   - -Miniseries 2
   - -Reality 3
   - -Scripted 4
   - -'Talk Show' 5
   - -Video 6
   */
	with_type?: TvShowTypes;

	/**
	 * without_companies
	 ** Filter the results to exclude the specific production companies you specify here. `AND` / `OR` filters are supported.
	 */
	without_companies?: string;
}
