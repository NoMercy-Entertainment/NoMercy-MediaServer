import { InferModel, and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { userData } from '../schema/userData';

export type NewUserData = InferModel<typeof userData, 'insert'>;
export const insertUserData = (data: NewUserData, constraint: Array<'tv_id' | 'movie_id' | 'special_id'>) => globalThis.mediaDb.insert(userData)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: [userData.user_id, userData.videoFile_id, ...constraint.map(c => userData[c])],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type UserData = InferModel<typeof userData, 'select'>;
export type UserDataWithRelations = ReturnType<typeof selectUserData>;
export const selectUserData = () => {
	return globalThis.mediaDb.query.userData.findMany({
		with: {
			tv: true,
			movie: true,
			special: true,
			user: true,
			videoFile: true,
		},
	});
};

export type UserDataWithRelationsFromUser = ReturnType<typeof selectFromUserData>;
export const selectFromUserData = ({ user_id, language }) => {

	const userDatas = globalThis.mediaDb.query.userData.findMany({
		with: {
			tv: true,
			movie: true,
			special: true,
			user: true,
			videoFile: true,
		},
		where: and(
			eq(userData.user_id, user_id),
			isNotNull(userData.time)
		),
		orderBy: desc(userData.updated_at),
	});

	const tvGids = userDatas.filter(u => !!u.tv_id).map(u => u.tv_id!)
		.concat(0);
	const movieGids = userDatas.filter(u => !!u.movie_id).map(u => u.movie_id!)
		.concat(0);

	const translationsResponse = globalThis.mediaDb.query.translations.findMany({
		where: (translations, { eq, and, or }) => or(
			and(
				eq(translations.iso6391, language),
				inArray(translations.tv_id, tvGids)
			),
			and(
				eq(translations.iso6391, language),
				inArray(translations.movie_id, movieGids)
			)
		),
	});

	const imagesResponse = globalThis.mediaDb.query.images.findMany({
		where: (images, { eq, and, or }) => or(
			and(
				eq(images.type, 'logo'),
				inArray(images.tv_id, tvGids)
			),
			and(
				eq(images.type, 'logo'),
				inArray(images.movie_id, movieGids)
			)
		),
	});

	const mediasResponse = globalThis.mediaDb.query.medias.findMany({
		where: (medias, { eq, and, or }) => or(
			and(
				eq(medias.type, 'Trailer'),
				inArray(medias.tv_id, tvGids)
			),
			and(
				eq(medias.type, 'Trailer'),
				inArray(medias.movie_id, movieGids)
			)
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
			certification: {
				columns: {
					rating: true,
					iso31661: true,
				},
			},
		},
	});

	const tvCertificationResponse = globalThis.mediaDb.query.certification_tv.findMany({
		where: (certification_tv, { and, or, eq }) => or(
			and(
				inArray(certification_tv.tv_id, tvGids),
				eq(certification_tv.iso31661, 'NL')
			),
			and(
				inArray(certification_tv.tv_id, tvGids),
				eq(certification_tv.iso31661, 'US')
			)
		),
		columns: {
			tv_id: true,
		},
		with: {
			certification: {
				columns: {
					rating: true,
					iso31661: true,
				},
			},
		},
	});

	const certifications = [
		...movieCertificationResponse,
		...tvCertificationResponse,
	];

	return userDatas.map((u) => {
		const d = u.tv ?? u.movie ?? u.special;
		return {
			...u,
			translations: translationsResponse.filter(t => t.tv_id == d?.id || t.movie_id == d?.id),
			images: imagesResponse.filter(i => i.tv_id == d?.id || i.movie_id == d?.id),
			medias: mediasResponse.filter(m => m.tv_id == d?.id || m.movie_id == d?.id),
			certification: certifications.filter((c: any) => (c.tv_id ?? c.movie_id) == d?.id)[0]?.certification,
		};
	});

};
