import { insertRole } from '@server/db/media/actions/roles';
import logger from '@server/functions/logger';
import { SeasonAppend } from '../../../providers/tmdb/season/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { Cast, insertCast } from '@server/db/media/actions/casts';
import Logger from '@server/functions/logger/logger';
import { Crew } from '@server/db/media/actions/crews';

// import createBlurHash from '@server/functions/createBlurHash';

export default (
	req: CompleteTvAggregate | SeasonAppend,
	castArray: Array<Cast | Crew>,
	people: number[],
	type: 'tv' | 'season'
) => {

	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding cast for: ${(req as CompleteTvAggregate).name}`,
	});

	for (const cast of (req as CompleteTvAggregate | SeasonAppend).aggregate_credits.cast) {
		if (!people.includes(cast.id)) continue;

		for (const role of cast.roles ?? []) {
			try {
				insertCast({
					id: role.credit_id,
					person_id: cast.id,
					[`${type}_id`]: req.id,
				});

				insertRole({
					cast_id: role.credit_id,
					character: role.character,
					credit_id: role.credit_id,
					episodeCount: role.episode_count,
				});

			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify(['aggregate cast', error]),
				});
			}
		}

		// if (cast.profile_path) {
		// 	downloadAndHash({
		// 		src: cast.profile_path,
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
		message: `Cast for: ${(req as CompleteTvAggregate).name} added successfully`,
	});
};
