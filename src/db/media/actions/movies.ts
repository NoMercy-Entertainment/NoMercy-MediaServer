
import { convertBooleans } from '../../helpers';
import { InferModel, ReturnTypeOrValue, and, inArray } from 'drizzle-orm';
import { movies } from '../schema/movies';

export type NewMovie = InferModel<typeof movies, 'insert'>;
export const insertMovie = (data: NewMovie) => globalThis.mediaDb.insert(movies)
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
export const getMoviesDB = () => globalThis.mediaDb.select()
	.from(movies)
	.all();

export type MovieWithRelations = ReturnTypeOrValue<typeof getMovie> | null;

export const getMovie = ({ id, user_id, language }: { id: number, user_id: string, language: string }) => {

	const movieData = globalThis.mediaDb.query.movies.findFirst({
		where: (movies, { eq }) => eq(movies.id, id),
		with: {
			alternativeTitles: {
				columns: {
					title: true,
					iso31661: true,
				},
			},
			certification_movie: {
				columns: {},
				with: {
					certification: {
						columns: {
							rating: true,
							iso31661: true,
						},
					},
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
					keyword: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			},
			library: true,
			userData: true,
		},
	});

	if (!movieData?.id) {
		return null;
	}

	const mediasData = globalThis.mediaDb.query.medias.findMany({
		where: (medias, { eq }) => and(
			eq(medias.movie_id, id),
			eq(medias.type, 'Trailer')),
	});

	const imagesData = globalThis.mediaDb.query.images.findMany({
		where: (images, { eq }) => eq(images.movie_id, id),
	});

	const similarData = globalThis.mediaDb.query.similars.findMany({
		where: (similars, { eq }) => eq(similars.movieFrom_id, id),
	});

	const recommendationData = globalThis.mediaDb.query.recommendations.findMany({
		where: (recommendations, { eq }) => eq(recommendations.movieFrom_id, id),
	});

	const castsData = globalThis.mediaDb.query.casts.findMany({
		where: (casts, { eq }) => eq(casts.movie_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});

	const crewsData = globalThis.mediaDb.query.crews.findMany({
		where: (crews, { eq }) => eq(crews.movie_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});
	
	const personData = castsData.length === 0 && crewsData.length === 0
		? []
		: globalThis.mediaDb.query.people.findMany({
			where: (people) => inArray(people.id, [
				...castsData.map(cast => cast.person_id), 
				...crewsData.map(crew => crew.person_id)
			]),
			columns: {
				id: true,
				name: true,
				deathday: true,
				profile: true,
				colorPalette: true,
				gender: true,
				knownForDepartment: true,
				popularity: true,
			},
		});

	const rolesData = castsData.length === 0
		? []
		: globalThis.mediaDb.query.roles.findMany({
			where: (roles) => inArray(roles.cast_id, castsData.map(cast => cast.id)),
			columns: {
				cast_id: true,
				character: true,
			},
		});

	const jobsData = crewsData.length === 0
		? []
		: globalThis.mediaDb.query.jobs.findMany({
			where: (jobs) => inArray(jobs.crew_id, crewsData.map(crew => crew.id)),
			columns: {
				crew_id: true,
				job: true,
			},
		});

	const videoFileData = globalThis.mediaDb.query.videoFiles.findMany({
		where: (medias, { eq }) => eq(medias.movie_id, id),
		columns: {
			id: true,
			duration: true,
			movie_id: true,
			share: true,
		},
		with: {
			userData: {
				where: (userData, { eq }) => eq(userData.user_id, user_id),
			},
		},
	});

	if (videoFileData.length === 0) {
		return null;
	}

	const translationsData = globalThis.mediaDb.query.translations.findMany({
		where: (translations, { eq, or, and }) => 
			and(
				eq(translations.iso6391, language),
				eq(translations.movie_id, id)
			),
	});

	return {
		...movieData,
		similar_from: similarData,
		recommendation_from: recommendationData,
		casts: castsData.map(cast => ({
			...cast,
			person: personData.find(person => person.id === cast.person_id)!,
			roles: rolesData.filter(role => role.cast_id === cast.id)!,
		})),
		crews: crewsData.map(crew => ({
			...crew,
			person: personData.find(person => person.id === crew.person_id)!,
			jobs: jobsData.filter(job => job.crew_id === crew.id)!,
		})),
		videoFiles: videoFileData.filter(videoFile => videoFile.movie_id === id),
		translations: translationsData.filter(translation => translation.movie_id === id),
		medias: mediasData,
		images: imagesData,
	};

};

export type MoviePlaybackWithRelations = ReturnTypeOrValue<typeof getMoviePlayback> | null;
export const getMoviePlayback = ({ id, user_id, language }: { id: number; user_id: string; language: string }) => {

	const movieData = globalThis.mediaDb.query.movies.findFirst({
		where: (movies, { eq }) => eq(movies.id, id),
		with: {
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
		},
	});

	if (!movieData) {
		return null;
	}

	const mediasData = globalThis.mediaDb.query.medias.findMany({
		where: (medias, { eq, and }) => and(
			eq(medias.movie_id, id),
			eq(medias.type, 'logo')),
	});

	const translationsData = globalThis.mediaDb.query.translations.findMany({
		where: (translations, { eq, and }) => and(
			eq(translations.iso6391, language),
			eq(translations.tv_id, id)
		),
	});

	const result = {
		...movieData,
		translations: translationsData,
		medias: mediasData,
	};

	return result;
};
