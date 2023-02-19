import { CompleteMovieAggregate } from './fetchMovie';
import { CompleteTvAggregate } from './fetchTvShow';
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { Prisma } from '../../database/config/client';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { confDb } from '../../database/config';
import createBlurHash from '../../functions/createBlurHash/createBlurHash';

export default async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	crewArray: Array<
		Prisma.CrewMovieCreateOrConnectWithoutMovieInput
		| Prisma.CrewTvCreateOrConnectWithoutTvInput
		| Prisma.CrewSeasonCreateOrConnectWithoutSeasonInput
		| Prisma.CrewEpisodeCreateOrConnectWithoutEpisodeInput
	>,
	people: number[]
) => {
	// Logger.log({
	// 	level: 'info',
	// 	name: 'App',
	// 	color: 'magentaBright',
	// 	message: `Adding crew for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title}`,
	// });
	for (const crew of req.credits.crew) {
		if (!people.includes(crew.id)) continue;

		const crewsInsert = Prisma.validator<Prisma.CrewUncheckedCreateInput>()({
			id: crew.credit_id,
			personId: crew.id,
			adult: crew.adult,
			creditId: crew.credit_id,
			department: crew.department,
			gender: crew.gender,
			job: crew.job,
			knownForDepartment: crew.known_for_department,
			name: crew.name,
			originalName: crew.original_name,
			popularity: crew.popularity,
			profilePath: crew.profile_path,
			blurHash: crew.profile_path
				? await createBlurHash(`https://image.tmdb.org/t/p/w185${crew.profile_path}`)
				: undefined,
		});

		transaction.push(
			confDb.crew.upsert({
				where: {
					creditId: crew.credit_id,
				},
				update: crewsInsert,
				create: crewsInsert,
			})
		);

		crewArray.push({
			where: {
				creditId: crew.credit_id,
			},
			create: {
				creditId: crew.credit_id,
			},
		});
	}

	// Logger.log({
	// 	level: 'info',
	// 	name: 'App',
	// 	color: 'magentaBright',
	// 	message: `Crew for: ${(req as CompleteTvAggregate).name ?? (req as CompleteMovieAggregate).title} added successfully`,
	// });
};
