import { convertBooleans } from '../../helpers';
import { eq, inArray, InferModel, ReturnTypeOrValue } from 'drizzle-orm';
import { tvs } from '../schema/tvs';
import i18next from 'i18next';
import { sortBy } from '@server/functions/stringArray';
import { isOwner } from '@server/api/middleware/permissions';

export type NewTv = InferModel<typeof tvs, 'insert'>;
export const insertTv = (data: NewTv) => globalThis.mediaDb.insert(tvs)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: tvs.id,
		set: convertBooleans(data, true),
	})
	.returning()
	.get();

export type Tv = InferModel<typeof tvs, 'select'>;
export const selectTv = (data: Tv, user_id: string) => {
	return globalThis.mediaDb.query.tvs.findFirst({
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
			userData: {
				where: (userData, { eq }) => eq(userData.user_id, user_id),
			},
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

export type TvUpdate = Partial<InferModel<typeof tvs, 'insert'>> & { id: number };
export const updateTv = (data: TvUpdate) => globalThis.mediaDb.update(tvs)
	.set(convertBooleans(data))
	.where(eq(tvs.id, data.id))
	.returning()
	.get();

export const deleteTv = (id: number) => globalThis.mediaDb.delete(tvs)
	.where(eq(tvs.id, id))
	.returning()
	.get();

export const selectTvsDB = () => globalThis.mediaDb.select()
	.from(tvs)
	.all();

export const selectTvDB = (id: number) => globalThis.mediaDb.select()
	.from(tvs)
	.where(eq(tvs.id, id))
	.get();

export type TvWithRelations = ReturnTypeOrValue<typeof getTv>;

export const getTv = ({
	id,
	user_id,
	language,
}: { id: number, user_id: string, language: string }) => {

	const tvData = globalThis.mediaDb.query.tvs.findFirst({
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
			library: {
				with: {
					library_user: true,
				},
			},
			userData: {
				where: (userData, { eq }) => eq(userData.user_id, user_id),
			},
		},
	});

	if (!tvData || (!tvData?.library?.library_user?.some(l => l.user_id === user_id) && !isOwner(user_id))) {
		return null;
	}

	const mediasData = globalThis.mediaDb.query.medias.findMany({
		where: (medias, {
			eq,
			and,
		}) => and(
			eq(medias.tv_id, id),
			eq(medias.type, 'Trailer')
		),
	});

	const imagesData = globalThis.mediaDb.query.images.findMany({
		where: (images, {
			eq,
			and,
			or,
		}) => or(
			and(
				eq(images.tv_id, id),
				eq(images.iso6391, 'en'),
				eq(images.type, 'logo')
			),
			and(
				eq(images.tv_id, id),
				eq(images.type, 'poster')
			),
			and(
				eq(images.tv_id, id),
				eq(images.type, 'backdrop')
			)
		),
		orderBy: (images, { desc }) => desc(images.voteAverage),
	});

	const similarData = globalThis.mediaDb.query.similars.findMany({
		where: (similars, { eq }) => eq(similars.tvFrom_id, id),
	});

	const recommendationData = globalThis.mediaDb.query.recommendations.findMany({
		where: (recommendations, { eq }) => eq(recommendations.tvFrom_id, id),
	});

	const castsData = globalThis.mediaDb.query.casts.findMany({
		where: (casts, { eq }) => eq(casts.tv_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});

	const crewsData = globalThis.mediaDb.query.crews.findMany({
		where: (crews, { eq }) => eq(crews.tv_id, id),
		columns: {
			id: true,
			person_id: true,
		},
	});

	const personData = globalThis.mediaDb.query.people.findMany({
		where: people => inArray(people.id, [
			...castsData.map(cast => cast.person_id),
			...crewsData.map(crew => crew.person_id),
		]),
		columns: {
			id: true,
			name: true,
			deathDay: true,
			profile: true,
			color_palette: true,
			gender: true,
			knownForDepartment: true,
			popularity: true,
		},
	});

	const rolesData = globalThis.mediaDb.query.roles.findMany({
		where: roles => inArray(roles.cast_id, castsData.map(cast => cast.id)),
		columns: {
			cast_id: true,
			character: true,
		},
	});

	const jobsData = globalThis.mediaDb.query.jobs.findMany({
		where: jobs => inArray(jobs.crew_id, crewsData.map(crew => crew.id)),
		columns: {
			crew_id: true,
			job: true,
		},
	});

	const seasonsData = globalThis.mediaDb.query.seasons.findMany({
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

	const episodesData = globalThis.mediaDb.query.episodes.findMany({
		where: (episodes, { eq }) => eq(episodes.tv_id, id),
		columns: {
			id: true,
			seasonNumber: true,
			episodeNumber: true,
			overview: true,
			title: true,
			still: true,
			color_palette: true,
			airDate: true,
		},
	});

	const videoFileData = globalThis.mediaDb.query.videoFiles.findMany({
		where: medias => inArray(medias.episode_id, episodesData.map(episode => episode.id)),
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

	const translationsData = globalThis.mediaDb.query.translations.findMany({
		where: (translations, {
			eq,
			or,
			and,
		}) =>
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
			episodes: episodesData.filter(episode => episode.seasonNumber === season.seasonNumber)
				.map(episode => ({
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
export const getTvPlayback = ({
	id,
	user_id,
	language,
}: { id: number, user_id: string, language: string }) => {

	const tvData = globalThis.mediaDb.query.tvs.findFirst({
		where: (tvs, { eq }) => eq(tvs.id, id),
		with: {
			library: {
				with: {
					library_user: true,
				},
			},
			certification_tv: {
				with: {
					certification: true,
				},
			},
		},
	});

	if (!tvData || (!tvData?.library?.library_user?.some(l => l.user_id === user_id) && !isOwner(user_id))) {
		return null;
	}

	const seasonsData = globalThis.mediaDb.query.seasons.findMany({
		where: (seasons, { eq }) => eq(seasons.tv_id, id),
	});

	const episodesData = globalThis.mediaDb.query.episodes.findMany({
		where: (episodes, { eq }) => eq(episodes.tv_id, id),
	});

	if (episodesData.length === 0) {
		return null;
	}
	const videoFileData = globalThis.mediaDb.query.videoFiles.findMany({
		where: medias => inArray(medias.episode_id, episodesData.map(episode => episode.id)),
		with: {
			userData: {
				where: (userData, { eq }) => eq(userData.user_id, user_id),
			},
		},
	});

	const imagesData = globalThis.mediaDb.query.images.findMany({
		where: (images, {
			eq,
			and,
		}) => and(
			eq(images.tv_id, id),
			eq(images.type, 'logo'),
			eq(images.iso6391, 'en')
		),
		orderBy: (images, { desc }) => desc(images.voteAverage),
	});

	const translationsData = globalThis.mediaDb.query.translations.findMany({
		where: (translations, {
			eq,
			or,
			and,
		}) => or(
			and(
				eq(translations.iso6391, language),
				eq(translations.tv_id, id)
			),
			and(
				eq(translations.iso6391, language),
				inArray(translations.season_id, seasonsData.map(season => season.id)
					.flat())
			),
			and(
				eq(translations.iso6391, language),
				inArray(translations.episode_id, episodesData.map(episode => episode.id)
					.flat())
			)
		),
	});

	const result = {
		...tvData,
		seasons: sortBy(seasonsData, 'seasonNumber')
			.map(season => ({
				...season,
				translation: translationsData.find(t => t.season_id === season.id),
				episodes: sortBy(episodesData.filter(episode => episode.seasonNumber === season.seasonNumber), 'episodeNumber')
					.map(episode => ({
						...episode,
						season: season,
						translations: translationsData.filter(t => t.episode_id === episode.id),
						videoFiles: videoFileData.filter(videoFile => videoFile.episode_id === episode.id),
						tv: {
							...tvData,
							images: imagesData,
							translations: translationsData.filter(t => t.tv_id === id),
						},
					})),
			})),
		translations: translationsData.filter(translation => translation.tv_id === id),
	};

	return result;
};
