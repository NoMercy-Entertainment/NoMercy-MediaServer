import axios from 'axios';

import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import { QueueJob } from '../../database/queue/client';
import createBlurHash from '../../functions/createBlurHash';
import { parseYear } from '../../functions/dateTime';
import Logger from '../../functions/logger';
import i18n from '../../loaders/i18n';
import Person from '../../providers/tmdb/people';
import { createTitleSort } from '../../tasks/files/filenameParser';
import downloadTVDBImages from '../images/downloadTVDBImages';
import aggregateCast from './aggregateCast';
import aggregateCrew from './aggregateCrew';
import alternative_title from './alternative_title';
import creator from './creator';
import fetchTvShow from './fetchTvShow';
import findMediaFiles from './files';
import genre from './genre';
import { image } from './image';
import keyword from './keyword';
import person from './person';
import recommendation from './recommendation';
import season from './season';
import similar from './similar';
import translation from './translation';

export const storeTvShow = async ({ id, folder, libraryId, job }:
	{ id: number; folder?: string, libraryId: string, job?: QueueJob }) => {
	// console.log({ id, folder, libraryId, job });
	await i18n.changeLanguage('en');

	const tv = await fetchTvShow(id);
	if (!tv) {
		return;
	}

	try {
		const transaction: Prisma.PromiseReturnType<any>[] = [];

		const alternativeTitlesInsert: Array<Prisma.AlternativeTitlesCreateOrConnectWithoutTvInput> = [];
		const castInsert: Array<Prisma.CastCreateOrConnectWithoutTvInput> = [];
		const crewInsert: Array<Prisma.CrewCreateOrConnectWithoutTvInput> = [];
		const createdByInsert: Array<Prisma.CreatorCreateOrConnectWithoutTvInput> = [];
		const genresInsert: Array<Prisma.GenreTvCreateOrConnectWithoutTvInput> = [];
		const keywordsInsert: Array<Prisma.KeywordTvCreateOrConnectWithoutTvInput> = [];

		let Type = 'tv';

		if (!job || (job?.payload && !JSON.parse(job?.payload as string).error)) {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: `Adding TV Show: ${tv.name}`,
			});
		}

		await person(tv, transaction);

		const people = (tv.people as unknown as Person[]).map(p => p.id) as unknown as number[];

		genre(tv, genresInsert, 'tv');
		alternative_title(tv, alternativeTitlesInsert, 'tv');
		keyword(tv, transaction, keywordsInsert, 'tv');

		const year = parseYear(tv.first_air_date);

		let duration: number | null = null;
		const Duration: number = Math.round(tv.episode_run_time.reduce((ert, c) => ert + c, 0) / tv.episode_run_time.length);

		if (!isNaN(Duration) && tv.episode_run_time.length > 0) {
			duration = Duration;
		}

		await axios
			.get(`https://kitsu.io/api/edge/anime?filter[text]=${tv.name}&filter[year]=${year}`, {
				timeout: 2000,
			})
			.then((response) => {
				for (const data of response.data.data) {
					if (data.attributes.titles.en?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					} else if (data.attributes.titles.en_jp?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					} else if (data.attributes.titles.en_us?.toLowerCase() == tv.name.toLowerCase()) {
						Type = 'anime';
					}
				}
			})
			.catch(e => console.log(e));

		const blurHash = {
			poster: tv.poster_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${tv.poster_path}`)
				: undefined,
			backdrop: tv.backdrop_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${tv.backdrop_path}`)
				: undefined,
		};

		await creator(tv, createdByInsert, people);
		await aggregateCast(tv, castInsert, people, 'tv');
		await aggregateCrew(tv, crewInsert, people, 'tv');

		// @ts-ignore
		const tvInsert = Prisma.validator<Prisma.TvUncheckedCreateInput>()({
			backdrop: tv.backdrop_path,
			duration: duration,
			firstAirDate: tv.first_air_date,
			homepage: tv.homepage,
			id: tv.id,
			imdbId: tv.external_ids?.imdb_id,
			tvdbId: tv.external_ids?.tvdb_id,
			inProduction: tv.in_production,
			lastEpisodeToAir: tv.last_episode_to_air?.id,
			mediaType: Type,
			nextEpisodeToAir: tv.next_episode_to_air?.id,
			numberOfEpisodes: tv.number_of_episodes,
			numberOfSeasons: tv.number_of_seasons,
			originCountry: tv.origin_country.join(', '),
			originalLanguage: tv.original_language,
			overview: tv.overview,
			popularity: tv.popularity,
			poster: tv.poster_path,
			blurHash: JSON.stringify(blurHash),
			spokenLanguages: tv.spoken_languages.map(sl => sl.iso_639_1).join(', '),
			status: tv.status,
			tagline: tv.tagline,
			title: tv.name,
			titleSort: createTitleSort(tv.name, tv.first_air_date),
			type: tv.type,
			voteAverage: tv.vote_average,
			voteCount: tv.vote_count,
			folder: folder?.replace(/.*[\\\/](.*)/u, '/$1'),
			libraryId: libraryId,
			Genre: {
				connectOrCreate: genresInsert,
			},
			AlternativeTitles: {
				connectOrCreate: alternativeTitlesInsert,
			},
			Cast: {
				connectOrCreate: castInsert,
			},
			Crew: {
				connectOrCreate: crewInsert,
			},
			Keyword: {
				connectOrCreate: keywordsInsert,
			},
			Creator: {
				connectOrCreate: createdByInsert,
			},
		});

		transaction.push(
			confDb.tv.upsert({
				where: {
					id: tv.id,
				},
				update: tvInsert,
				create: tvInsert,
			})
		);

		await season(tv, transaction, people);

		translation(tv, transaction, 'tv');

		await recommendation(tv, transaction, 'tv');
		await similar(tv, transaction, 'tv');

		for (const video of tv.videos.results) {
			const mediaInsert = Prisma.validator<Prisma.MediaUncheckedCreateInput>()({
				iso6391: video.iso_639_1,
				name: video.name,
				site: video.site,
				size: video.size,
				src: video.key,
				type: video.type,
				tvId: tv.id,
			});

			transaction.push(
				confDb.media.upsert({
					where: {
						src: video.key,
					},
					update: mediaInsert,
					create: mediaInsert,
				})
			);
		}

		for (const content_rating of tv.content_ratings.results || []) {
			const cert = await confDb.certification.findFirst({
				where: {
					iso31661: content_rating.iso_3166_1,
					rating: content_rating.rating,
				},
			});

			if (!cert) continue;

			const tvRatingsInsert = Prisma.validator<Prisma.CertificationTvUncheckedCreateInput>()({
				iso31661: content_rating.iso_3166_1,
				tvId: tv.id,
				certificationId: cert.id,
			});

			transaction.push(
				confDb.certificationTv.upsert({
					where: {
						tvId_iso31661: {
							iso31661: content_rating.iso_3166_1,
							tvId: tv.id,
						},
					},
					create: tvRatingsInsert,
					update: tvRatingsInsert,
				})
			);
		}

		await image(tv, transaction, 'backdrop', 'tv');
		await image(tv, transaction, 'logo', 'tv');
		await image(tv, transaction, 'poster', 'tv');

		await downloadTVDBImages({ type: 'tv', data: tv });

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Committing data to the database for: ${tv.name}`,
		});

		await confDb.$transaction(transaction).catch(e => console.log(e));

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Searching media files for: ${tv.name}`,
		});

		await findMediaFiles({ type: 'tv', data: tv, folder, libraryId, sync: true });

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `TV Show: ${tv.name} added successfully`,
		});

		return {
			success: true,
			message: `TV Show: ${tv.name} added successfully`,
			data: tv,
		};

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'App',
			color: 'red',
			message: JSON.stringify(error),
		});

		return {
			success: false,
			message: `Something went wrong adding ${tv.name}`,
			error: error,
		};
	}

};

export default storeTvShow;
