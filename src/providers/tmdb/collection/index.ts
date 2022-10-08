import i18next from 'i18next';
import Logger from '../../../functions/logger';
import tmdbApiClient from '../tmdbApiClient';
import { CollectionWithAppends } from './collection-details';
import { CollectionTranslations } from './collection_translations';

export * from './collection';
export * from './collection-details';
export * from './collection_translations';

export const collectionAppend = ['content_ratings', 'credits', 'external_ids', 'images', 'translations'] as const;

export default async function collection(id: number) {
	Logger.log({
		level: 'info',
		name: 'MovieDB',
		color: 'blue',
		message: `Fetching Collection with id: ${id}`,
	});

	const params = {
		params: {
			append_to_response: collectionAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<CollectionWithAppends<typeof collectionAppend[number]>>(`collection/${id}`, params);

	// data.content_ratings.results[0].NL[0].rating
	return data;
}


export const collectionTranslations = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'MovieDB',
		color: 'blue',
		message: `Fetching Collection translations with id: ${id}`,
	});

	const { data } = await tmdbApiClient.get<CollectionTranslations>(`person/${id}/translations`);

	return data;
};