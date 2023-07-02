import { SeasonAppend } from '@/providers/tmdb/season';

import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { CompleteTvAggregate } from './fetchTvShow';
import { insertCrew } from '@/db/media/actions/crews';
import { insertJob } from '@/db/media/actions/jobs';
import Logger from '@/functions/logger/logger';

export default (
	req: CompleteTvAggregate | SeasonAppend,
	crewArray: Array<
		| Prisma.CrewCreateOrConnectWithoutTvInput
		| Prisma.CrewCreateOrConnectWithoutSeasonInput
	>,
	people: number[],
	type: 'tv' | 'season'
) => {
	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding crew for: ${(req as CompleteTvAggregate).name}`,
	});

	for (const crew of (req as CompleteTvAggregate | SeasonAppend).aggregate_credits.crew) {
		if (!people.includes(crew.id)) continue;

		for (const job of crew.jobs ?? []) {

			try {
				insertCrew({
					id: job.credit_id,
					person_id: crew.id,
					[`${type}_id`]: req.id,
				});

				insertJob({
					crew_id: job.credit_id,
					job: job.job,
					credit_id: job.credit_id,
					episodeCount: job.episode_count,
				});

			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['aggregate crew', error]),
				});
			}
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
		message: `Crew for: ${(req as CompleteTvAggregate).name} added successfully`,
	});
};
