
import { convertBooleans } from '../../helpers';
import { InferModel, eq, ReturnTypeOrValue, inArray, and } from 'drizzle-orm';
import { mediaDb } from '..';
import { tvs } from '../schema/tvs';
import i18next from 'i18next';
import { sortBy } from '@server/functions/stringArray';

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
export const selectTv = (data: Tv) => {
	return mediaDb.query.tvs.findFirst({
		with: {
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
					where: (translations, { eq }) => (eq(translations.iso6391, i18next.language)),
				},
			},
		where: (files, { eq }) => eq(files[`${Object.entries(data)[0][0]}`], Object.entries(data)[0][1]),
	});
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

export type TvWithRelations = ReturnTypeOrValue<typeof getTv>;

export const getTv = ({ id, user_id, language }: { id: number, user_id: string, language: string }) => {

	const tvData = mediaDb.query.tvs.findFirst({
		where: (tvs, { eq }) => eq(tvs.id, id),
		with: {
			alternativeTitles: {
				columns: {
					title: true,
					iso31661: true,
				},
			},
			certification_tv: {
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
			genre_tv: {
				columns: {},
				with: {
					genre: true,
				},
			},
			keyword_tv: {
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

	if (!tvData?.id) {
		return null;
	}

	const mediasData = mediaDb.query.medias.findMany({
		where: (medias, { eq }) => and(
			eq(medias.tv_id, id),
			eq(medias.type, 'Trailer')),
	});

	const imagesData = mediaDb.query.images.findMany({
		where: (images, { eq }) => eq(images.tv_id, id),
	});

	const similarData = mediaDb.query.similars.findMany({
		where: (similars, { eq }) => eq(similars.tvFrom_id, id),
	});

	const recommendationData = mediaDb.query.recommendations.findMany({
		where: (recommendations, { eq }) => eq(recommendations.tvFrom_id, id),
	});

	const castsData = mediaDb.query.casts.findMany({
		where: (casts, { eq }) => eq(casts.tv_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});

	const crewsData = mediaDb.query.crews.findMany({
		where: (crews, { eq }) => eq(crews.tv_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});

	const personData = mediaDb.query.people.findMany({
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

	const rolesData = mediaDb.query.roles.findMany({
		where: (roles) => inArray(roles.cast_id, castsData.map(cast => cast.id)),
		columns: {
			cast_id: true,
			character: true,
		},
	});

	const jobsData = mediaDb.query.jobs.findMany({
		where: (jobs) => inArray(jobs.crew_id, crewsData.map(crew => crew.id)),
		columns: {
			crew_id: true,
			job: true,
		},
	});

	const seasonsData = mediaDb.query.seasons.findMany({
		where: (seasons, { eq }) => eq(seasons.tv_id, id),
		columns: {
			id: true,
			seasonNumber: true,
			overview: true,
			title: true,
			poster: true,
			colorPalette: true,
		},
	});

	const episodesData = mediaDb.query.episodes.findMany({
		where: (episodes, { eq }) => eq(episodes.tv_id, id),
		columns: {
			id: true,
			seasonNumber: true,
			episodeNumber: true,
			overview: true,
			title: true,
			still: true,
			colorPalette: true,
			airDate: true,
		},
	});

	const videoFileData = mediaDb.query.videoFiles.findMany({
		where: (medias) => inArray(medias.episode_id, episodesData.map(episode => episode.id)),
		columns: {
			id: true,
			duration: true,
			episode_id: true,
		},
		with: {
			userData: {
				where: (userData, { eq }) => eq(userData.user_id, user_id),
			},
		},
	});

	const translationsData = mediaDb.query.translations.findMany({
		where: (translations, { eq, or, and }) => 
			or(
				and(
					eq(translations.iso6391, language),
					eq(translations.tv_id, id)
				),
				and(
					eq(translations.iso6391, language),
					inArray(translations.season_id, seasonsData.map(season => season.id))
				),
				and(
					eq(translations.iso6391, language),
					inArray(translations.episode_id, episodesData.map(episode => episode.id))
				)
			),
	});

	const result = {
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
		seasons: seasonsData.map(season => ({
			...season,
			translation: translationsData.find(t => t.season_id === season.id),
			episodes: episodesData.filter(episode => episode.seasonNumber === season.seasonNumber).map(episode => ({
				...episode,
				translation: translationsData.find(t => t.episode_id === episode.id),
				videoFiles: videoFileData.filter(videoFile => videoFile.episode_id === episode.id),
			})),
		})),
		translations: translationsData.filter(translation => translation.tv_id === id),
		medias: mediasData,
		images: imagesData,
		similar_from: similarData,
		recommendation_from: recommendationData,
		...tvData,
	};

	return result;
};

export type TvPlaybackWithRelations = ReturnTypeOrValue<typeof getTvPlayback> | null;
export const getTvPlayback = ({ id, language }: {id: number, language: string}) => {

	const tvData = mediaDb.query.tvs.findFirst({
		where: (tvs, { eq }) => eq(tvs.id, id),
		with: {
			library: true,
			certification_tv: {
				with: {
					certification: true,
				},
			},
		},
	});

	if (!tvData) {
		return null;
	}

	const seasonsData = mediaDb.query.seasons.findMany({
		where: (seasons, { eq }) => eq(seasons.tv_id, id),
	});

	const episodesData = mediaDb.query.episodes.findMany({
		where: (episodes, { eq }) => eq(episodes.tv_id, id),
	});

	const videoFileData = mediaDb.query.videoFiles.findMany({
		where: (medias) => inArray(medias.episode_id, episodesData.map(episode => episode.id)),
		with: {
			userData: true,
		},
	});

	const mediasData = mediaDb.query.medias.findMany({
		where: (medias, { eq }) => and(
			eq(medias.tv_id, id),
			eq(medias.type, 'logo')),
	});

	const translationsData = mediaDb.query.translations.findMany({
		where: (translations, { eq, or, and }) => or(
			and(
				eq(translations.iso6391, language),
				eq(translations.tv_id, id)
			),
			and(
				eq(translations.iso6391, language),
				inArray(translations.season_id, seasonsData.map(season => season.id).flat())
			),
			and(
				eq(translations.iso6391, language),
				inArray(translations.episode_id, episodesData.map(episode => episode.id).flat())
			)
		),
	});

	const result = {
		...tvData,
		seasons: sortBy(seasonsData, 'seasonNumber').map(season => ({
			...season,
			translation: translationsData.find(t => t.season_id === season.id),
			episodes: sortBy(episodesData.filter(episode => episode.seasonNumber === season.seasonNumber), 'episodeNumber').map(episode => ({
				...episode,
				translations: translationsData.filter(t => t.episode_id === episode.id),
				videoFiles: videoFileData.filter(videoFile => videoFile.episode_id === episode.id),
				tv: {
					...tvData,
					medias: mediasData,
					translations: translationsData.filter(t => t.tv_id === id),
				},
			})),
		})),
		translations: translationsData.filter(translation => translation.tv_id === id),
	};

	return result;
};
