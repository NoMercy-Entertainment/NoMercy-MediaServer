import { CollectionTranslations } from './collection_translations';
import { CollectionWithAppends } from './collection-details';
import Logger from '../../../functions/logger';
import i18next from 'i18next';
import tmdbApiClient from '../tmdbApiClient';

export * from './collection';
export * from './collection-details';
export * from './collection_translations';

export const collectionAppend = ['content_ratings', 'credits', 'external_ids', 'images', 'translations'] as const;

export default async function collection(id: number) {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Collection with id: ${id}`,
	});

	const params = {
		params: {
			append_to_response: collectionAppend.join(','),
			include_image_language: `en,null,${i18next.language}`,
			include_video_language : `en,null,${i18next.language}`,
		},
	};

	const { data } = await tmdbApiClient.get<CollectionWithAppends<typeof collectionAppend[number]>>(`collection/${id}`, params);

	// data.content_ratings.results[0].NL[0].rating
	return data;
}


export const collectionTranslations = async (id: number) => {
	Logger.log({
		level: 'info',
		name: 'moviedb',
		color: 'blue',
		message: `Fetching Collection translations with id: ${id}`,
	});

	const { data } = await tmdbApiClient.get<CollectionTranslations>(`person/${id}/translations`);

	return data;
};