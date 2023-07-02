
import { convertBooleans } from '../../helpers';
import { InferModel, and, eq, inArray } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { movies } from '../schema/movies';
import { RequireOnlyOne } from '@/types/helpers';
import i18next from 'i18next';
import { translations } from '../schema/translations';
import { AlternativeTitle } from './alternativeTitles';
import { Recommendation } from './recommendations';
import { Similar } from './similars';
import { Translation } from './translations';
import { UserData } from './userData';
import { casts } from '../schema/casts';
import { crews } from '../schema/crews';
import { people } from '../schema/people';
import { roles } from '../schema/roles';
import { jobs } from '../schema/jobs';
import { medias } from '../schema/medias';
import { Cast } from './casts';
import { Person } from './people';
import { Role } from './roles';
import { Crew } from './crews';
import { Job } from './jobs';
import { Media } from './medias';
import { Certification } from './certifications';
import { Genre } from './genres';
import { Keyword } from './keywords';
import { Library } from './libraries';
import { VideoFile } from './videoFiles';
import { Image } from './images';

export type NewMovie = InferModel<typeof movies, 'insert'>;
export const insertMovie = (data: NewMovie) => mediaDb.insert(movies)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [movies.id],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type Movie = InferModel<typeof movies, 'select'>;
export const getMoviesDB = (relations = false) => {
	if (relations) {
		return mediaDb.query.posts.findMany({
			with: {
				library: true,
				alternativeTitles: true,
				casts: true,
				crews: true,
				certification_movie: true,
				collection_movie: true,
				genre_movie: true,
				specialItems: true,
				videoFiles: true,
				keyword_movie: true,
				medias: true,
				userData: true,
				files: true,
				translation: true,
				recommendation_from: true,
				recommendation_to: true,
				similar_from: true,
				similasimilar_torsTo: true,
			},
		});
	}
	return mediaDb.select()
		.from(movies)
		.all();
};

export type MovieWithRelations = Movie & {
	alternativeTitles: AlternativeTitle[];
	casts: (Cast & {
		person: Person | undefined;
		roles: Role[];
	})[];
	crews: (Crew & {
		person: Person | undefined;
		jobs: Job[];
	})[];
	medias: Media[];
	images: Image[];
	certification_movie: {
		certification: Certification;
	}[];
	genre_movie: {
		genre: Genre;
	}[];
	keyword_movie: {
		keyword: Keyword;
	}[];
	library: Library;
	userData: UserData[];
	recommendation_from: Recommendation[];
	similar_from: Similar[];
	videoFiles: (VideoFile & {
		userData: UserData[];
	})[];
	translation: {
		title: Translation['title'];
		overview: Translation['overview'];
		iso31661: Translation['iso31661'];
	} | undefined;
};

type SelectMovie = RequireOnlyOne<{ id: number; }>
export const getMovie = <B extends boolean>(data: SelectMovie, relations?: B): B extends true ? MovieWithRelations | null : Movie | null => {

	const movieData = mediaDb.select({
		id: movies.id,
	})
		.from(movies)
		.where(eq(movies.id, data.id))
		.get();

	if (!movieData) {
		return null;
	}

	const castsData = mediaDb.select()
		.from(casts)
		.where(eq(casts.movie_id, data.id))
		.all();

	const crewsData = mediaDb.select()
		.from(crews)
		.where(eq(crews.movie_id, data.id))
		.all();

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

	const mediasData = mediaDb.select()
		.from(medias)
		.where(eq(medias.movie_id, data.id))
		.all();

	const translationsData = mediaDb.select()
		.from(translations)
		.where(
			and(
				eq(translations.iso6391, i18next.language),
				eq(translations.movie_id, data.id)
			)
		)
		.all() as unknown as Translation[];

	const result = mediaDb.query.movies.findFirst({
		with: relations
			? {
				alternativeTitles: {
					columns: {
						title: true,
						iso31661: true,
					},
				},
				certification_movie: {
					columns: {},
					with: {
						certification: true,
					},
				},
				genre_movie: {
					columns: {},
					with: {
						genre: true,
					},
				},
				keyword_movie: {
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
				videoFiles: {
					with: {
						userData: true,
					},
				},
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? MovieWithRelations : Movie;

	if (relations) {
		(result as MovieWithRelations).medias = mediasData;
		(result as MovieWithRelations).translation = translationsData.find(t => t.movie_id === result.id);
		(result as MovieWithRelations).casts = castsData.map(cast => ({
			...cast,
			person: peoplesData.find(person => person.id === cast.person_id),
			roles: rolesData.filter(role => role.cast_id === cast.id),
		}));

		(result as MovieWithRelations).crews = crewsData.map(crew => ({
			...crew,
			person: peoplesData.find(person => person.id === crew.person_id),
			jobs: jobsData.filter(job => job.crew_id === crew.id),
		}));
	}

	return result;
};
export const getMoviePlayback = <B extends boolean>(data: SelectMovie, relations?: B): B extends true ? MovieWithRelations | null : Movie | null => {

	const movieData = mediaDb.select({
		id: movies.id,
	})
		.from(movies)
		.where(eq(movies.id, data.id))
		.get();

	if (!movieData) {
		return null;
	}

	const mediasData = mediaDb.select()
		.from(medias)
		.where(eq(medias.movie_id, data.id))
		.all();

	const translationsData = mediaDb.select()
		.from(translations)
		.where(
			and(
				eq(translations.iso6391, i18next.language),
				eq(translations.movie_id, data.id)
			)
		)
		.all() as unknown as Translation[];

	const result = mediaDb.query.movies.findFirst({
		with: relations
			? {
				certification_movie: {
					columns: {},
					with: {
						certification: true,
					},
				},
				library: true,
				videoFiles: {
					with: {
						userData: true,
					},
				},
			}
			: {},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	}) as unknown as B extends true ? MovieWithRelations : Movie;

	if (relations) {
		(result as MovieWithRelations).medias = mediasData;
		(result as MovieWithRelations).translation = translationsData.find(t => t.movie_id === result.id);
	}

	return result;
};
