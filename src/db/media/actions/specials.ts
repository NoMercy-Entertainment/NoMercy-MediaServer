import { InferModel, and, eq, inArray, or } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { specials } from '../schema/specials';
import { createId } from '@paralleldrive/cuid2';
import { translations } from '../schema/translations';
import i18next from 'i18next';
import { casts } from '../schema/casts';
import { crews } from '../schema/crews';
import { people } from '../schema/people';
import { roles } from '../schema/roles';
import { jobs } from '../schema/jobs';
import { certification_tv } from '../schema/certification_tv';
import { certification_movie } from '../schema/certification_movie';
import { certifications } from '../schema/certifications';
import { medias } from '../schema/medias';

export type NewSpecial = InferModel<typeof specials, 'insert'>;
export const insertSpecial = (data: NewSpecial) => globalThis.mediaDb.insert(specials)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: specials.title,
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Special = InferModel<typeof specials, 'select'>;
export const selectSpecial = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.specials.findMany({
			with: {
				specialItems: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(specials)
		.all();
};

export type SelectSpecial = ReturnType<typeof getSpecial>;
export const getSpecial = ({id}: {id: string}) => {

	const result = globalThis.mediaDb.query.specials.findFirst({
		where: (specials, { eq }) => eq(specials.id, id),
		with: {
			specialItems: {
				with: {
					episode: {
						with: {
							season: true,
							videoFiles: {
								with: {
									userData: true,
								},
							},
							tv: {
								with: {
									genre_tv: {
										with: {
											genre: true,
										},
									},
								},
							},
						},
					},
					movie: {
						with: {
							genre_movie: {
								with: {
									genre: true,
								},
							},
							videoFiles: {
								with: {
									userData: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!result) {
		return null;
	}

	const tvIds = result
		.specialItems.map(specialItem => specialItem.episode?.tv?.id).flat()
		.filter(i => i !== undefined) as number[];
	const episodeIds = result
		.specialItems.map(specialItem => specialItem.episode?.id).flat()
		.filter(i => i !== undefined) as number[];
	const movieIds = result
		.specialItems.map(specialItem => specialItem.movie?.id).flat()
		.filter(i => i !== undefined) as number[];

	const translationsData = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(translations)
			.where(
				or(
					and(
						eq(translations.iso6391, i18next.language),
						inArray(translations.tv_id, tvIds)
					),
					and(
						eq(translations.iso6391, i18next.language),
						inArray(translations.movie_id, movieIds)
					)
				)
			)
			.all()
		: [];


	const castsData = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(casts)
			.where(
				or(
					inArray(casts.tv_id, tvIds),
					inArray(casts.episode_id, episodeIds),
					inArray(casts.movie_id, movieIds)
				)
			)
			.all()
		: [];

	const crewsData = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(crews)
			.where(
				or(
					inArray(crews.tv_id, tvIds),
					inArray(crews.episode_id, episodeIds),
					inArray(crews.movie_id, movieIds)
				)
			)
			.all()
		: [];

	const peoples = [...castsData.map(cast => cast.person_id), ...crewsData.map(crew => crew.person_id)];
	if (peoples.length === 0) {
		return result;
	}

	const peoplesData = peoples.length > 0
		? globalThis.mediaDb.select()
			.from(people)
			.where(inArray(people.id, peoples))
			.all()
		: [];

	const rolesData = castsData.length > 0
		? globalThis.mediaDb.select()
			.from(roles)
			.where(inArray(roles.cast_id, castsData.map(cast => cast.id)))
			.all()
		: [];

	const jobsData = crewsData.length > 0
		? globalThis.mediaDb.select()
			.from(jobs)
			.where(inArray(jobs.crew_id, crewsData.map(crew => crew.id)))
			.all()
		: [];

	const tvCertifications = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(certification_tv)
			.where(inArray(certification_tv.tv_id, tvIds))
			.all()
		: [];

	const movieCertifications = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(certification_movie)
			.where(inArray(certification_movie.movie_id, movieIds))
			.all()
		: [];

	const certificationData = tvCertifications.length > 0 && movieCertifications.length > 0
		? globalThis.mediaDb.select()
			.from(certifications)
			.where(inArray(certifications.id, tvCertifications.map(c => c.certification_id)
				.concat(movieCertifications.map(c => c.certification_id))))
			.all()
		: [];

	const mediasData = tvIds.length > 0 || movieIds.length > 0
		? globalThis.mediaDb.select()
			.from(medias)
			.where(
				or(
					inArray(medias.tv_id, tvIds),
					inArray(medias.movie_id, movieIds)
				)
			)
			.all()
		: [];

	const data = {
		...result,
		specialItems: result.specialItems.map(specialItem => ({
			...specialItem,
			episode: specialItem.episode
				? {
					...specialItem.episode,
					translation: translationsData.find(t => t.episode_id === specialItem.episode?.id),
					certifications: tvCertifications.filter(c => c.tv_id === specialItem.episode?.tv?.id).map((c) => {
						const certification = certificationData.find(cert => cert.id === c.certification_id)!;
						return {
							certification: {
								id: certification.id,
								iso31661: certification.iso31661,
								order: certification.order,
								rating: certification.rating,
								meaning: certification.meaning,
							},
						};
					}),
					tv: {
						...specialItem.episode?.tv,
						translation: translationsData.find(t => t.tv_id === specialItem.episode?.tv?.id),
					},
					medias: mediasData.filter(m => m.tv_id === specialItem.episode?.tv?.id),
					videoFiles: specialItem.episode?.videoFiles.map(videoFile => ({
						...videoFile,
						userData: videoFile.userData,
					})),
				}
				: undefined,
			movie: specialItem.movie
				? {
					...specialItem.movie,
					translation: translationsData.find(t => t.movie_id === specialItem.movie?.id),
					certifications: movieCertifications.filter(c => c.movie_id === specialItem.movie?.id).map((c) => {
						const certification = certificationData.find(cert => cert.id === c.certification_id)!;
						return {
							certification: {
								id: certification.id,
								iso31661: certification.iso31661,
								order: certification.order,
								rating: certification.rating,
								meaning: certification.meaning,
							},
						};
					}),
					medias: mediasData.filter(m => m.movie_id === specialItem.movie?.id),
					videoFiles: specialItem.movie?.videoFiles.map(videoFile => ({
						...videoFile,
						userData: videoFile.userData,
					})),
				}
				: undefined,
		})),

		credits: {
			cast: castsData.map(cast => ({
				...cast,
				person: peoplesData.find(person => person.id === cast.person_id),
				roles: rolesData.filter(r => r.cast_id === cast.id),
			})),
			crew: crewsData.map(crew => ({
				...crew,
				person: peoplesData.find(person => person.id === crew.person_id),
				jobs: jobsData.filter(j => j.crew_id === crew.id),
			})),
		},

		movies: movieIds.length,
		episodes: episodeIds.length,
		genres: result.specialItems
			.map(specialItem => specialItem.episode?.tv?.genre_tv ?? []).flat()
			.concat(result.specialItems.map(specialItem => specialItem?.movie?.genre_movie ?? []).flat())
			.map(g => ({
				id: g.genre_id,
				name: g.genre.name,
			})),
	};

	return data;
};

