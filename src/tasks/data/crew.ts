import { Prisma } from '../../database/config/client';
import logger from '../../functions/logger';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { CompleteMovieAggregate } from './fetchMovie';
import { downloadAndHash } from './image';

export default async (
	req: EpisodeAppend | CompleteMovieAggregate,
	crewArray: Array<
		Prisma.CrewCreateOrConnectWithoutMovieInput
		| Prisma.CrewCreateOrConnectWithoutEpisodeInput
	>,
	people: number[],
	type: 'episode' | 'movie'
) => {
	logger.log({
		level: 'verbose',
		name: 'App',
		color: 'magentaBright',
		message: `Adding crew for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title}`,
	});

	for (const crew of req.credits.crew) {
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
					connectOrCreate: {
						where: {
							crewId_creditId: {
								crewId: crew.id,
								creditId: crew.credit_id,
							},
						},
						create: {
							job: crew.job,
							creditId: crew.credit_id,
							episodeCount: crew.total_episode_count,
						},
					},
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
		message: `Crew for: ${(req as EpisodeAppend).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	});
};
