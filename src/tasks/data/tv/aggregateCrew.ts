import { SeasonAppend } from '@server/providers/tmdb/season';

import logger from '@server/functions/logger';
import { CompleteTvAggregate } from './fetchTvShow';
import { Crew, insertCrew } from '@server/db/media/actions/crews';
import { insertJob } from '@server/db/media/actions/jobs';
import Logger from '@server/functions/logger/logger';
import { Cast } from '@server/db/media/actions/casts';

export default (
	req: CompleteTvAggregate | SeasonAppend,
	crewArray: Array<Cast | Crew>,
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

			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['aggregate crew', error]),
				});
			}
			try {
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
					message: JSON.stringify(['aggregate job', error]),
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
