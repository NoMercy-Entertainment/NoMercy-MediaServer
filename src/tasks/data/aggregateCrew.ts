import { SeasonAppend } from '@/providers/tmdb/season';

import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { CompleteTvAggregate } from './fetchTvShow';
import { downloadAndHash } from './image';

export default async (
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

		crewArray.push({
			where: {
				[`personId_${type}Id`]: {
					personId: crew.id,
					[`${type}Id`]: req.id,
				},
			},
			create: {
				personId: crew.id,
				Jobs: {
					connectOrCreate: crew.jobs?.map(job => ({
						where: {
							crewId_creditId: {
								crewId: crew.id,
								creditId: job.credit_id,
							},
						},
						create: {
							creditId: job.credit_id,
							job: job.job,
							episodeCount: job.episode_count!,
						},
					})),
				},
			},
		});

		if (crew.profile_path) {
			await downloadAndHash({
				src: crew.profile_path,
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
		message: `Crew for: ${(req as CompleteTvAggregate).name} added successfully`,
	});
};
