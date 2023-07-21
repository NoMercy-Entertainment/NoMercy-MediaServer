import { Cast, insertCast } from '@server/db/media/actions/casts';
import logger from '@server/functions/logger';
import { EpisodeAppend } from '@server/providers/tmdb/episode/index';
import { CompleteMovieAggregate } from './movie/fetchMovie';
import { insertRole } from '@server/db/media/actions/roles';
import Logger from '@server/functions/logger/logger';
import { Crew } from '@server/db/media/actions/crews';

export default (
	req: EpisodeAppend | CompleteMovieAggregate,
	castArray: Array<Cast | Crew>,
	people: number[],
	type: 'movie' | 'tv' | 'season' | 'episode'
) => {

	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding cast for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title}`,
	});

	for (const cast of req.credits.cast) {
		if (!people.includes(cast.id)) continue;

		try {
			insertCast({
				id: cast.credit_id,
				person_id: cast.id,
				[`${type}_id`]: req.id,
			});

		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['cast', error]),
			});
		}

		try {
			insertRole({
				credit_id: cast.credit_id,
				character: cast.character,
				episodeCount: cast.total_episode_count,
				cast_id: cast.credit_id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['role', error]),
			});
		}
		// if (cast.profile_path) {
		// 	 downloadAndHash({
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
		message: `Cast for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
