
import { convertBooleans } from '../../helpers';
import { InferModel, and, eq, inArray, or } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { tvs } from '../schema/tvs';
import { RequireOnlyOne } from '@/types/helpers';
import { AlternativeTitle } from './alternativeTitles';
import { Crew } from './crews';
import { Media } from './medias';
import { UserData } from './userData';
import { Recommendation } from './recommendations';
import { Similar } from './similars';
import { Translation } from './translations';
import { Cast } from './casts';
import i18next from 'i18next';
import { translations } from '../schema/translations';
import { Person } from './people';
import { Role } from './roles';
import { Certification } from './certifications';
import { Job } from './jobs';
import { Season } from './seasons';
import { casts } from '../schema/casts';
import { crews } from '../schema/crews';
import { people } from '../schema/people';
import { roles } from '../schema/roles';
import { jobs } from '../schema/jobs';
import { medias } from '../schema/medias';
import { Genre } from './genres';
import { Keyword } from './keywords';
import { Library } from './libraries';
import { Episode } from './episodes';
import { VideoFile } from './videoFiles';
import { Image } from './images';

export type NewTv = InferModel<typeof tvs, 'insert'>;
export const insertTv = (data: NewTv) => mediaDb.insert(tvs)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: tvs.id,
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Tv = InferModel<typeof tvs, 'select'>;
export const selectTv = <B extends boolean>(data: SelectTv, relations?: B): B extends true ? TvWithRelations[] : Tv[] => {
	return mediaDb.query.tvs.findFirst({
		with: relations
			? {
				alternativeTitles: true,
				casts: {
					with: {
						person: true,
						roles: true,
					},
				},
				crews: {
					with: {
						person: true,
						jobs: true,
					},
				},
				seasons: true,
				medias: true,
				certification_tv: true,
				genre_tv: {
					with: {
						genre: true,
					},
				},
				keyword_tv: {
					with: {
						keyword: true,
					},
				},
				userData: true,
				recommendation_from: true,
				recommendation_to: true,
				similar_from: true,
				similar_to: true,
				translations: {
					where: (table: typeof translations, { eq }) => (eq(table.iso6391, i18next.language)),
				},
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? TvWithRelations[] : Tv[];
};

export type TvUpdate = Partial<InferModel<typeof tvs, 'select'>> & { id: number };
export const updateTv = (data: TvUpdate) => mediaDb.update(tvs)
	.set({
		...convertBooleans(data),
	})
	.where(eq(tvs.id, data.id))
	.returning()
	.get();

export const deleteTv = (id: number) => mediaDb.delete(tvs)
	.where(eq(tvs.id, id))
	.returning()
	.get();

export const selectTvsDB = () => mediaDb.select()
	.from(tvs)
	.all();

export const selectTvDB = (id: number) => mediaDb.select()
	.from(tvs)
	.where(eq(tvs.id, id))
	.get();


export type TvWithRelations = Tv & {
	alternativeTitles: AlternativeTitle[];
	casts: (Cast & {
		person: Person | undefined;
		roles: Role[];
	})[];
	crews: (Crew & {
		person: Person | undefined;
		jobs: Job[];
	})[];
	creators: (Crew & {
		person: Person | undefined;
		jobs: Job[];
	})[];
	medias: Media[];
	images: Image[];
	certification_tv: {
		certification: Certification;
	}[];
	genre_tv: {
		genre: Genre;
	}[];
	keyword_tv: {
		keyword: Keyword;
	}[];
	library: Library;
	userData: UserData[];
	recommendation_from: Recommendation[];
	similar_from: Similar[];
	translation: {
		title: Translation['title'];
		overview: Translation['overview'];
		iso6391: Translation['iso6391'];
	} | undefined;
	seasons: (Season & {
		translation: {
			title: Translation['title'];
			overview: Translation['overview'];
			iso6391: Translation['iso6391'];
		} | undefined;
		episodes: (Episode & {
			translation: {
				title: Translation['title'];
				overview: Translation['overview'];
			} | undefined;
			tv: Tv & {
				translation: {
					title: Translation['title'];
					overview: Translation['overview'];
					iso6391: Translation['iso6391'];
				} | undefined,
				certification_tv: {
					certification: Certification;
				}[];
				medias: Media[];
			};
			userData: UserData[];
			medias: Media[];
			videoFiles: (VideoFile & {
				userData: UserData[];
			})[];
		})[];
	})[],
};

type SelectTv = RequireOnlyOne<{ id: number; }>
export const getTv = <B extends boolean>(data: SelectTv, relations?: B): B extends true ? TvWithRelations | null : Tv | null => {
	let castsData: Cast[] = new Array<Cast>();
	let crewsData: Crew[] = new Array<Crew>();
	let peoplesData: Person[] = new Array<Person>();
	let rolesData: Role[] = new Array<Role>();
	let jobsData: Job[] = new Array<Job>();
	let mediasData: Media[] = new Array<Media>();

	const tvData = mediaDb.select({
		id: tvs.id,
	})
		.from(tvs)
		.where(eq(tvs.id, data.id))
		.get();

	if (!tvData) {
		return null;
	}

	mediaDb.transaction((tx) => {

		castsData = tx.select()
			.from(casts)
			.where(eq(casts.tv_id, data.id))
			.all();

		crewsData = tx.select()
			.from(crews)
			.where(eq(crews.tv_id, data.id))
			.all();

		const peoples = [...castsData.map(cast => cast.person_id), ...crewsData.map(crew => crew.person_id)];
		if (peoples.length === 0) {
			return null;
		}

		peoplesData = peoples.length > 0
			? tx.select()
				.from(people)
				.where(inArray(people.id, peoples))
				.all()
			: [];

		rolesData = castsData.length > 0
			? tx.select()
				.from(roles)
				.where(inArray(roles.cast_id, castsData.map(cast => cast.id)))
				.all()
			: [];

		jobsData = crewsData.length > 0
			? tx.select()
				.from(jobs)
				.where(inArray(jobs.crew_id, crewsData.map(crew => crew.id)))
				.all()
			: [];

		mediasData = tx.select()
			.from(medias)
			.where(eq(medias.tv_id, data.id))
			.all();

	});

	const result = mediaDb.query.tvs.findFirst({
		with: relations
			? {
				alternativeTitles: {
					columns: {
						title: true,
						iso31661: true,
					},
				},
				certification_tv: {
					columns: {},
					with: {
						certification: true,
					},
				},
				genre_tv: {
					columns: {},
					with: {
						genre: true,
					},
				},
				keyword_tv: {
					columns: {},
					with: {
						keyword: true,
					},
				},
				images: {
					// columns: {
					// 	filePath: true,
					// 	type: true,
					// },
					// where: (table: typeof images, { eq }) => (eq(table.type, 'logo')),
				},
				library: true,
				recommendation_from: true,
				similar_from: true,
				seasons: {
					with: {
						episodes: {
							with: {
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
	}) as unknown as B extends true ? TvWithRelations : Tv;

	const translationsData = mediaDb.select()
		.from(translations)
		.where(
			or(
				and(
					eq(translations.iso6391, i18next.language),
					eq(translations.tv_id, data.id)
				),
				and(
					eq(translations.iso6391, i18next.language),
					inArray(translations.season_id, (result as TvWithRelations)
						.seasons.map(season => season.id).flat())
				),
				and(
					eq(translations.iso6391, i18next.language),
					inArray(translations.episode_id, (result as TvWithRelations)
						.seasons.map(season => season.episodes.map(episode => episode.id).flat()).flat())
				)
			)
		)
		.all() as unknown as Translation[];

	if (relations) {
		(result as TvWithRelations).medias = mediasData;
		(result as TvWithRelations).casts = castsData.map(cast => ({
			...cast,
			person: peoplesData.find(person => person.id === cast.person_id),
			roles: rolesData.filter(role => role.cast_id === cast.id),
		}));

		(result as TvWithRelations).crews = crewsData.map(crew => ({
			...crew,
			person: peoplesData.find(person => person.id === crew.person_id),
			jobs: jobsData.filter(job => job.crew_id === crew.id),
		}));

		(result as TvWithRelations).translation = translationsData.find(t => t.tv_id === result.id);
		(result as TvWithRelations).seasons = (result as TvWithRelations).seasons.map(season => ({
			...season,
			translation: translationsData.find(t => t.season_id === season.id),
			episodes: season.episodes.map(episode => ({
				...episode,
				userData: episode.userData,
				translation: translationsData.find(t => t.episode_id === episode.id),
				tv: {
					...(result as TvWithRelations),
					translation: translationsData.find(t => t.tv_id === result.id),
					medias: mediasData,
				},
			})),
		}));

		(result as TvWithRelations).creators = (result as TvWithRelations).crews.filter(crew => crew.jobs.find(job => job.job === 'Creator'));
	}

	return result;
};
export const getTvPlayback = <B extends boolean>(data: SelectTv, relations?: B): B extends true ? TvWithRelations | null : Tv | null => {

	const tvData = mediaDb.select({
		id: tvs.id,
	})
		.from(tvs)
		.where(eq(tvs.id, data.id))
		.get();

	if (!tvData) {
		return null;
	}

	const mediasData = mediaDb.select()
		.from(medias)
		.where(eq(medias.tv_id, data.id))
		.all();

	const result = mediaDb.query.tvs.findFirst({
		with: relations
			? {
				library: true,
				certification_tv: {
					with: {
						certification: true,
					},
				},
				seasons: {
					with: {
						episodes: {
							with: {
								videoFiles: {
									with: {
										userData: true,
									},
								},
							},
							// orderBy: asc(episodes.episodeNumber),
						},
					},
					// orderBy: asc(seasons.seasonNumber),
				},
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? TvWithRelations : Tv;

	const translationsData = mediaDb.select()
		.from(translations)
		.where(
			or(
				and(
					eq(translations.iso6391, i18next.language),
					eq(translations.tv_id, data.id)
				),
				and(
					eq(translations.iso6391, i18next.language),
					inArray(translations.season_id, (result as TvWithRelations)
						.seasons.map(season => season.id).flat())
				),
				and(
					eq(translations.iso6391, i18next.language),
					inArray(translations.episode_id, (result as TvWithRelations)
						.seasons.map(season => season.episodes.map(episode => episode.id).flat()).flat())
				)
			)
		)
		.all() as unknown as Translation[];

	if (relations) {
		(result as TvWithRelations).medias = mediasData;
		(result as TvWithRelations).translation = translationsData.find(t => t.tv_id === result.id);
		(result as TvWithRelations).seasons = (result as TvWithRelations).seasons.map(season => ({
			...season,
			translation: translationsData.find(t => t.season_id === season.id),
			episodes: season.episodes.map(episode => ({
				...episode,
				userData: episode.userData,
				translation: translationsData.find(t => t.episode_id === episode.id),
				tv: {
					...(result as TvWithRelations),
					translation: translationsData.find(t => t.tv_id === result.id),
					medias: mediasData,
				},
			})),
		}));
	}

	return result;
};
