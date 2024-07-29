import { InferModel, and, eq, gt, inArray } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { collections } from '../schema/collections';
import { translations } from '../schema/translations';

export type NewCollection = InferModel<typeof collections, 'insert'>;
export const insertCollection = (data: NewCollection) => globalThis.mediaDb.insert(collections)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: collections.id,
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Collection = InferModel<typeof collections, 'select'>;
export const selectCollection = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.collections.findMany({
			with: {
				collection_movie: true,
				translations: true,
				library: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(collections)
		.all();
};

export type GetCollection = ReturnType<typeof getCollection>;
export const getCollection = ({ id, user_id, language }: { id: number, user_id: string, language: string }) => {
	const data = globalThis.mediaDb.query.collections.findFirst({
		where: and(
			eq(collections.id, id),
			gt(collections.parts, 0)
		),
		with: {
			collection_movie: {
				columns: {},
				with: {
					movie: {
						with: {
							library: {
								with: {
									library_user: true,
								},
							},
							genre_movie: {
								with: {
									genre: true,
								},
							},
							certification_movie: {
								where: (certification_movie, { or, eq }) => or(
									eq(certification_movie.iso31661, 'NL'),
									eq(certification_movie.iso31661, 'US')
								),
								with: {
									certification: true,
								},
							},
						},
					},
				},
			},
			translations: {
				where: eq(translations.iso6391, language),
			},
		},
	});

	if (!data) {
		return null;
	}

	const movieGids = data.collection_movie?.map(c => c.movie.id) ?? [];

	const translationsResponse = globalThis.mediaDb.query.translations.findMany({
		where: (translations, { eq, and }) => and(
			eq(translations.iso6391, language),
			inArray(translations.movie_id, movieGids)
		),
	});

	const imagesResponse = globalThis.mediaDb.query.images.findMany({
		where: (images, { eq, and }) => and(
			eq(images.type, 'logo'),
			eq(images.iso6391, 'en'),
			inArray(images.movie_id, movieGids)
		),
	});

	const mediasResponse = globalThis.mediaDb.query.medias.findMany({
		where: (medias, { eq, and }) => and(
			eq(medias.type, 'Trailer'),
			inArray(medias.movie_id, movieGids)
		),
	});

	const movieCertificationResponse = globalThis.mediaDb.query.certification_movie.findMany({
		where: (certification_movie, { and, or, eq }) => or(
			and(
				inArray(certification_movie.movie_id, movieGids),
				eq(certification_movie.iso31661, 'NL')
			),
			and(
				inArray(certification_movie.movie_id, movieGids),
				eq(certification_movie.iso31661, 'US')
			)
		),
		columns: {
			movie_id: true,
		},
		with: {
			certification: true,
		},
	});

	const userDatasResponse = globalThis.mediaDb.query.userData.findMany({
		where: (userData, { eq, and }) => and(
			eq(userData.user_id, user_id),
			inArray(userData.movie_id, movieGids)
		),
	});

	if (!data) {
		return null;
	}

	const title = data.translations?.[0]?.title || data.title;
	const overview = data.translations?.[0]?.overview || data.overview;

	return {
		...data,
		title,
		overview,
		translations: data.translations.concat(translationsResponse),
		images: imagesResponse,
		medias: mediasResponse,
		certifications: movieCertificationResponse,
		userData: userDatasResponse,
	};
};
