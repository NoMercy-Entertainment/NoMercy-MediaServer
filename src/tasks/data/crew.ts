import { insertCrew } from '@/db/media/actions/crews';
import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { CompleteMovieAggregate } from './fetchMovie';
import { insertJob } from '@/db/media/actions/jobs';
import Logger from '@/functions/logger/logger';

export default (
	req: EpisodeAppend | CompleteMovieAggregate,
	crewArray: Array<
		Prisma.CrewCreateOrConnectWithoutMovieInput
		| Prisma.CrewCreateOrConnectWithoutEpisodeInput
	>,
	people: number[],
	type: 'movie' | 'tv' | 'season' | 'episode'
) => {
	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding crew for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title}`,
	});

	for (const crew of req.credits.crew) {
		if (!people.includes(crew.id)) continue;

		try {
			insertCrew({
				id: crew.credit_id,
				person_id: crew.id,
				[`${type}_id`]: req.id,
			});

		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['crew', error]),
			});
		}

		try {
			insertJob({
				credit_id: crew.credit_id,
				job: crew.job,
				episodeCount: crew.total_episode_count,
				crew_id: crew.credit_id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['job', error]),
			});
		}

		// if (crew.profile_path) {
		// 	await downloadAndHash({
		// 		src: crew.profile_path,
		// 		table: 'person',
		// 		column: 'profile',
		// 		type: 'crew',
		// 		only: ['colorPalette', 'blurHash'],
		// 	});
		// }
	}

	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Crew for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
