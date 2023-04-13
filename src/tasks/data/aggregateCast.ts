import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { downloadAndHash } from './image';

// import createBlurHash from '../../functions/createBlurHash';

export default async (
	req: CompleteTvAggregate | SeasonAppend,
	castArray: Array<
		| Prisma.CastCreateOrConnectWithoutTvInput
		| Prisma.CastCreateOrConnectWithoutSeasonInput
	>,
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
					connectOrCreate: cast.roles?.map(role => ({
						where: {
							castId_creditId: {
								castId: cast.id,
								creditId: role.credit_id,
							},
						},
						create: {
							creditId: role.credit_id,
							character: role.character,
							episodeCount: role.episode_count,
						},
					})),
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
		message: `Cast for: ${(req as CompleteTvAggregate).name} added successfully`,
	});
};
