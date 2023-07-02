
import Logger from '../../functions/logger';
import Person from '../../providers/tmdb/people';
import { Prisma } from '../../database/config/client';
import { QueueJob } from '../../database/queue/client';
import aggregateCast from './aggregateCast';
import aggregateCrew from './aggregateCrew';
import alternative_title from './alternative_title';
import axios from 'axios';
import colorPalette from '@/functions/colorPalette/colorPalette';
import createBlurHash from '../../functions/createBlurHash';
import { createTitleSort } from '../../tasks/files/filenameParser';
import creator from './creator';
import downloadTVDBImages from '../images/downloadTVDBImages';
import fetchTvShow from './fetchTvShow';
import findMediaFiles from './files';
import genre from './genre';
import i18n from '../../loaders/i18n';
import { image } from './image';
import keyword from './keyword';
import { parseYear } from '../../functions/dateTime';
import person from './person';
import recommendation from './recommendation';
import season from './season';
import similar from './similar';
import translation from './translation';
import { insertTv } from '@/db/media/actions/tvs';
import { insertMedia } from '@/db/media/actions/medias';
import { and, eq } from 'drizzle-orm';
import { insertCertification, selectCertification } from '@/db/media/actions/certifications';
import { certifications } from '@/db/media/schema/certifications';
import { insertCertificationTv } from '@/db/media/actions/certification_tv';
import { insertLibraryTv } from '@/db/media/actions/library_tv';

export const storeTvShow = async ({ id, folder, libraryId, job }:
	{ id: number; folder: string, libraryId: string, job?: QueueJob; }) => {
	console.log({ id, folder, libraryId, job });
	await i18n.changeLanguage('en');

	const tv = await fetchTvShow(id);
	if (!tv) {
		return;
	}

	try {
		let transaction: Prisma.PromiseReturnType<any>[] = [];

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

		const year = parseYear(tv.first_air_date);

		let duration: number | null = null;
		const Duration: number = Math.round(tv.episode_run_time.reduce((ert, c) => ert + c, 0) / tv.episode_run_time.length);

		if (!isNaN(Duration) && tv.episode_run_time.length > 0) {
			duration = Duration;
		}

		await axios
			.get(`https://kitsu.io/api/edge/anime?filter[text]=${tv.name}&filter[year]=${year}`, {
				timeout: 20000,
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

		const palette: any = {
			poster: undefined,
			backdrop: undefined,
		};

		const blurHash: any = {
			poster: undefined,
			backdrop: undefined,
		};

		await Promise.all([
			tv.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${tv.poster_path}`).then((hash) => {
				blurHash.poster = hash;
			}),
			tv.backdrop_path && createBlurHash(`https://image.tmdb.org/t/p/w185${tv.backdrop_path}`).then((hash) => {
				blurHash.backdrop = hash;
			}),
			tv.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${tv.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
			tv.backdrop_path && colorPalette(`https://image.tmdb.org/t/p/w185${tv.backdrop_path}`).then((hash) => {
				palette.backdrop = hash;
			}),
		]);

		try {
			insertTv({
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
				colorPalette: JSON.stringify(palette),
				spokenLanguages: tv.spoken_languages.map(sl => sl.iso_639_1).join(', '),
				status: tv.status,
				tagline: tv.tagline,
				title: tv.name,
				titleSort: createTitleSort(tv.name, tv.first_air_date),
				type: tv.type,
				voteAverage: tv.vote_average,
				voteCount: tv.vote_count,
				folder: folder.replace(/.*[\\\/](.*)/u, '/$1'),
				library_id: libraryId,
			});

			insertLibraryTv({
				library_id: libraryId,
				tv_id: tv.id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['tv', [error, libraryId, folder]]),
			});
			return {
				success: false,
				message: `Something went wrong adding ${tv.name}`,
				error: error,
			};
		}

		person(tv, transaction);

		transaction = [];
		const people = (tv.people as unknown as Person[]).map(p => p.id) as unknown as number[];

		genre(tv, genresInsert, 'tv');

		alternative_title(tv, alternativeTitlesInsert, 'tv');
		keyword(tv, transaction, keywordsInsert, 'tv');

		creator(tv, createdByInsert, people);
		aggregateCast(tv, castInsert, people, 'tv');
		aggregateCrew(tv, crewInsert, people, 'tv');

		await season(tv, transaction, people);

		translation(tv, transaction, 'tv');

		await recommendation(tv, transaction, 'tv');
		await similar(tv, transaction, 'tv');

		for (const video of tv.videos.results) {
			try {
				insertMedia({
					iso6391: video.iso_639_1,
					name: video.name,
					site: video.site,
					size: video.size,
					src: video.key,
					type: video.type,
					tv_id: tv.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['tv media', error]),
				});
			}
		}

		for (const content_rating of tv.content_ratings.results || []) {
			try {
				const certs = selectCertification({
					where: and(
						eq(certifications.iso31661, content_rating.iso_3166_1),
						eq(certifications.rating, content_rating.rating)
					),
				});

				const cert = certs.map(c => insertCertification({
					iso31661: content_rating.iso_3166_1,
					meaning: c!.meaning,
					order: c!.order,
					rating: content_rating.rating,
				}));

				cert.map(c => insertCertificationTv({
					iso31661: content_rating.iso_3166_1,
					tv_id: tv.id,
					certification_id: c.id,
				}));

			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['tv certification', error]),
				});
			}
			// const cert = await confDb.certification.findFirst({
			// 	where: {
			// 		iso31661: content_rating.iso_3166_1,
			// 		rating: content_rating.rating,
			// 	},
			// });

			// if (!cert) continue;

			// const tvRatingsInsert = Prisma.validator<Prisma.CertificationTvUncheckedCreateInput>()({
			// 	iso31661: content_rating.iso_3166_1,
			// 	tvId: tv.id,
			// 	certificationId: cert.id,
			// });

			// transaction.push(
			// 	confDb.certificationTv.upsert({
			// 		where: {
			// 			tvId_iso31661: {
			// 				iso31661: content_rating.iso_3166_1,
			// 				tvId: tv.id,
			// 			},
			// 		},
			// 		create: tvRatingsInsert,
			// 		update: tvRatingsInsert,
			// 	})
			// );
		}

		image(tv, transaction, 'backdrop', 'tv');
		image(tv, transaction, 'logo', 'tv');
		image(tv, transaction, 'poster', 'tv');

		downloadTVDBImages({ type: 'tv', data: tv });

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Committing data to the database for: ${tv.name}`,
		});

		// await confDb.$transaction(transaction).catch(e => console.log(e));

		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Searching media files for: ${tv.name}`,
		});

		try {
			await findMediaFiles({ type: 'tv', data: tv, folder, libraryId, sync: true });
		} catch (error) {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: JSON.stringify(['findMediaFiles tv', error]),
			});
		}

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
			message: JSON.stringify([`${__filename}`, error]),
		});

		return {
			success: false,
			message: `Something went wrong adding ${tv.name}`,
			error: JSON.stringify(error) == '{}'
				? `Something went wrong adding ${tv.name}`
				: error,
		};
	}

};

export default storeTvShow;
