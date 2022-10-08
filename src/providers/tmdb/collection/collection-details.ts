import { Movie } from '../movie';
import { ExternalIds } from '../shared/external_ids';
import { Collection } from './collection';
import { ContentRatings } from '../shared';
import { Credits } from '../movie/credits';
import { MovieImages } from '../movie';
import { CollectionTranslations } from './collection_translations';

export interface CollectionDetails extends Collection {
	parts: Movie[];
}

export interface CollectionAppend extends CollectionDetails {
	content_ratings: ContentRatings;
	credits: Credits;
	external_ids: ExternalIds;
	images: MovieImages;
	translations: CollectionTranslations;
}

export type CollectionWithAppends<T extends keyof CollectionAppend> = CollectionDetails & Pick<CollectionAppend, T>;
