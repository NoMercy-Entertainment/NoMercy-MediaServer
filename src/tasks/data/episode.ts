import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import cast from './cast';
import crew from './crew';
import { CombinedSeasons } from './fetchTvShow';
import guest_star from './guest_star';
import image from './image';
import translation from './translation';
import downloadTMDBImages from '../images/downloadTMDBImages';

const episode = async (id: number, season: CombinedSeasons, transaction: Prisma.PromiseReturnType<any>[],
	people: number[]) => {
	for (const episode of season.episodes) {
		if(!episode.id) continue;
		
		const guestStarInsert: any[] = [];
		const crewInsert: any[] = [];
		const castInsert: any[] = [];

		// await cast(episode, transaction, castInsert, people);
		// await crew(episode, transaction, crewInsert, people);
		// await guest_star(episode, transaction, guestStarInsert, people);

		if (episode?.still_path != '' && episode.still_path != null) {
			const mediaInsert = Prisma.validator<Prisma.MediaCreateInput>()({
				src: episode.still_path,
				type: 'still',
			});

			transaction.push(
				confDb.media.upsert({
					where: {
						src: episode.still_path,
					},
					update: mediaInsert,
					create: mediaInsert,
				})
			);
		}

		const episodesInsert = Prisma.validator<Prisma.EpisodeCreateInput>()({
			airDate: episode.air_date,
			episodeNumber: episode.episode_number,
			id: episode.id,
			title: episode.name,
			overview: episode.overview,
			productionCode: episode.production_code,
			seasonNumber: episode.season_number,
			still: episode.still_path,
			voteAverage: episode.vote_average,
			voteCount: episode.vote_count,
			imdbId: episode?.external_ids.imdb_id,
			Season: {
				connect:{
					id: season.id
				}
			},
			Tv: {
				connect:{
					id: id
				}
			},
			GuestStar: {
				connectOrCreate: guestStarInsert,
			},
			Cast: {
				connectOrCreate: castInsert,
			},
			Crew: {
				connectOrCreate: crewInsert,
			},
		});

		// transaction.push(
		await	confDb.episode.upsert({
				where: {
					id: episode.id,
				},
				update: episodesInsert,
				create: episodesInsert,
			})
		// );
		
		await translation(episode, transaction, 'episode');


		await downloadTMDBImages('episode', episode).catch(() => null);

		await image(episode, transaction, 'still', 'episode');
	}
};

export default episode;
