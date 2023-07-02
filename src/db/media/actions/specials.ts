import { InferModel, and, eq, inArray, or } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { specials } from '../schema/specials';
import { createId } from '@paralleldrive/cuid2';
import { RequireOnlyOne } from '@/types/helpers';
import { VideoFile } from './videoFiles';
import { UserData } from './userData';
import { Movie, MovieWithRelations } from './movies';
import { Episode } from './episodes';
import { SpecialItem } from './specialItems';
import { Tv } from './tvs';
import { translations } from '../schema/translations';
import i18next from 'i18next';
import { Translation } from './translations';
import { casts } from '../schema/casts';
import { crews } from '../schema/crews';
import { people } from '../schema/people';
import { roles } from '../schema/roles';
import { jobs } from '../schema/jobs';
import { Crew } from './crews';
import { Cast } from './casts';
import { Person } from './people';
import { Role } from './roles';
import { Job } from './jobs';
import { Season } from './seasons';
import { certification_tv } from '../schema/certification_tv';
import { CertificationTv } from './certification_tv';
import { certification_movie } from '../schema/certification_movie';
import { CertificationMovie } from './certification_movie';
import { certifications } from '../schema/certifications';
import { Certification } from './certifications';
import { medias } from '../schema/medias';
import { Media } from './medias';

export type NewSpecial = InferModel<typeof specials, 'insert'>;
export const insertSpecial = (data: NewSpecial) => mediaDb.insert(specials)
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
		return mediaDb.query.specials.findMany({
			with: {
				specialItems: true,
			},
		});
	}
	return mediaDb.select()
		.from(specials)
		.all();
};


export type SpecialWithRelations = Special & {
	specialItems: (SpecialItem & {
		episode: (Episode & {
			certifications: MovieWithRelations['certification_movie'];
			translation: {
				title: Translation['title'];
				overview: Translation['overview'];
			} | undefined;
			season: Season;
			tv: Tv & {
				translation: {
					title: Translation['title'];
					overview: Translation['overview'];
					iso6391: Translation['iso6391'];
				} | undefined,
				genre_tv: {
					genre: {
						name: string;
					};
				}[];
			};
			videoFiles: (VideoFile & {
				userData: UserData[];
			})[];
			medias: Media[];
		}) | undefined;
		movie: (Movie & {
			certifications: MovieWithRelations['certification_movie'];
			translation: {
				title: Translation['title'];
				overview: Translation['overview'];
			} | undefined;
			videoFiles: (VideoFile & {
				userData: UserData[];
			})[];
			genre_movie: {
				genre: {
					name: string;
				};
			}[];
			medias: Media[];
		}) | undefined;
	})[];
	credits: {
		cast: (Cast & {
			person: Person | undefined;
			roles: Role[];
		})[];
		crew: (Crew & {
			person: Person | undefined;
			jobs: Job[];
		})[];
	};
	movies: number;
	episodes: number;
	genres: {
		id: number;
		name: string;
	}[];
};

type SelectSpecial = RequireOnlyOne<{ id: string; }>
export const getSpecial = <B extends boolean>(data: SelectSpecial, relations?: B): B extends true ? SpecialWithRelations | null : Special | null => {

	const specialData = mediaDb.select({
		id: specials.id,
	})
		.from(specials)
		.where(eq(specials.id, data.id))
		.get();

	if (!specialData) {
		return null;
	}

	const result = mediaDb.query.specials.findFirst({
		with: relations
			? {
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
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? SpecialWithRelations : Special;

	const tvIds = (result as SpecialWithRelations)
		.specialItems.map(specialItem => specialItem.episode?.tv?.id).flat()
		.filter(i => i !== undefined) as number[];
	const episodeIds = (result as SpecialWithRelations)
		.specialItems.map(specialItem => specialItem.episode?.id).flat()
		.filter(i => i !== undefined) as number[];
	const movieIds = (result as SpecialWithRelations)
		.specialItems.map(specialItem => specialItem.movie?.id).flat()
		.filter(i => i !== undefined) as number[];

	const translationsData = mediaDb.select()
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
		.all() as unknown as Translation[];


	const castsData = mediaDb.select()
		.from(casts)
		.where(
			or(
				inArray(casts.tv_id, tvIds),
				inArray(casts.episode_id, episodeIds),
				inArray(casts.movie_id, movieIds)
			)
		)
		.all() as unknown as Cast[];

	const crewsData = mediaDb.select()
		.from(crews)
		.where(
			or(
				inArray(crews.tv_id, tvIds),
				inArray(crews.episode_id, episodeIds),
				inArray(crews.movie_id, movieIds)
			)
		)
		.all() as unknown as Crew[];

	const peoples = [...castsData.map(cast => cast.person_id), ...crewsData.map(crew => crew.person_id)];
	if (peoples.length === 0) {
		return null;
	}

	const peoplesData = peoples.length > 0
		? mediaDb.select()
			.from(people)
			.where(inArray(people.id, peoples))
			.all()
		: [];

	const rolesData = castsData.length > 0
		? mediaDb.select()
			.from(roles)
			.where(inArray(roles.cast_id, castsData.map(cast => cast.id)))
			.all()
		: [];

	const jobsData = crewsData.length > 0
		? mediaDb.select()
			.from(jobs)
			.where(inArray(jobs.crew_id, crewsData.map(crew => crew.id)))
			.all()
		: [];

	const tvCertifications = mediaDb.select()
		.from(certification_tv)
		.where(inArray(certification_tv.tv_id, tvIds))
		.all() as unknown as CertificationTv[];

	const movieCertifications = mediaDb.select()
		.from(certification_movie)
		.where(inArray(certification_movie.movie_id, movieIds))
		.all() as unknown as CertificationMovie[];

	const certificationData = mediaDb.select()
		.from(certifications)
		.where(inArray(certifications.id, tvCertifications.map(c => c.certification_id).concat(movieCertifications.map(c => c.certification_id))))
		.all() as unknown as Certification[];

	const mediasData = mediaDb.select()
		.from(medias)
		.where(
			or(
				inArray(medias.tv_id, tvIds),
				inArray(medias.movie_id, movieIds)
			)
		)
		.all();

	if (relations) {
		(result as SpecialWithRelations).specialItems = (result as SpecialWithRelations).specialItems.map(specialItem => ({
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
		}));

		(result as SpecialWithRelations).credits = {
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
		};

		(result as SpecialWithRelations).movies = movieIds.length;
		(result as SpecialWithRelations).episodes = episodeIds.length;
		(result as SpecialWithRelations).genres = (result as SpecialWithRelations).specialItems
			.map(specialItem => specialItem.episode?.tv?.genre_tv ?? []).flat()
			.concat((result as SpecialWithRelations).specialItems.map(specialItem => specialItem.movie?.genre_movie ?? []).flat())
			.map(g => ({
				// @ts-ignore
				id: g.genre_id,
				name: g.genre.name,
			}));
	}

	return result;
};

