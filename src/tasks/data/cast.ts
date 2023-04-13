import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { CompleteMovieAggregate } from './fetchMovie';
import { downloadAndHash } from './image';

export default async (
	req: EpisodeAppend | CompleteMovieAggregate,
	castArray: Array<
		Prisma.CastCreateOrConnectWithoutMovieInput
		| Prisma.CastCreateOrConnectWithoutEpisodeInput
	>,
	people: number[],
	type: 'episode' | 'movie'
) => {

	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding cast for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title}`,
	});

	for (const cast of req.credits.cast) {
		if (!people.includes(cast.id)) continue;

		castArray.push({
			where: {
				[`personId_${type}Id`]: {
					personId: cast.id,
					[`${type}Id`]: req.id,
				},
			},
			create: {
				personId: cast.id,
				Roles: {
					connectOrCreate: {
						where: {
							castId_creditId: {
								castId: cast.id,
								creditId: cast.credit_id,
							},
						},
						create: {
							character: cast.character,
							creditId: cast.credit_id,
							episodeCount: cast.total_episode_count,
						},
					},
				},
			},
		});

		if (cast.profile_path) {
			await downloadAndHash({
				src: cast.profile_path,
				table: 'person',
				column: 'profile',
				type: 'crew',
				only: ['colorPalette', 'blurHash'],
			});
		}
	}

	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Cast for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
