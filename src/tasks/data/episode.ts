import { downloadAndHash, image } from './image';

import { CombinedSeasons } from './fetchTvShow';
import Logger from '../../functions/logger';
import { Prisma } from '../../database/config/client';
import cast from './cast';
import { confDb } from '../../database/config';
import crew from './crew';
import guest_star from './guest_star';
import translation from './translation';

const episode = async (
	id: number,
	season: CombinedSeasons,
	transaction: Prisma.PromiseReturnType<any>[],
	people: number[]
) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding episodes for season: ${season.season_number}`,
	});

	for (const episode of season.episodes) {
		if (!episode.id) continue;

		const guestStarInsert: Array<Prisma.GuestStarCreateOrConnectWithoutEpisodeInput> = [];
		const castInsert: Array<Prisma.CastCreateOrConnectWithoutEpisodeInput> = [];
		const crewInsert: Array<Prisma.CrewCreateOrConnectWithoutEpisodeInput> = [];

		await guest_star(episode, guestStarInsert, people);
		await cast(episode, castInsert, people, 'episode');
		await crew(episode, crewInsert, people, 'episode');

		// @ts-ignore
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
				connect: {
					id: season.id,
				},
			},
			Tv: {
				connect: {
					id: id,
				},
			},
			// GuestStar: {
			// 	connectOrCreate: guestStarInsert,
			// },
			// Cast: {
			// 	connectOrCreate: castInsert,
			// },
			// Crew: {
			// 	connectOrCreate: crewInsert,
			// },
		});

		// transaction.push(
		await	confDb.episode.upsert({
			where: {
				id: episode.id,
			},
			update: episodesInsert,
			create: episodesInsert,
		});
		// );

		if (episode?.still_path != '' && episode.still_path != null) {
			const mediaInsert = Prisma.validator<Prisma.MediaUncheckedCreateInput>()({
				src: episode.still_path,
				type: 'still',
				episodeId: episode.id,
			});

			// transaction.push(
			await	confDb.media.upsert({
				where: {
					src: episode.still_path,
				},
				update: mediaInsert,
				create: mediaInsert,
			});
			// );
		}

		await translation(episode, transaction, 'episode');
		await image(episode, transaction, 'still', 'episode');

		if (episode.still_path) {
			await downloadAndHash({
				src: episode.still_path,
				table: 'episode',
				column: 'still',
				type: 'episode',
			});
		}
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Episodes for season: ${season.season_number} added successfully`,
	});
};

export default episode;
