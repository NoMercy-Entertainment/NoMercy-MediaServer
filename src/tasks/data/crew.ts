import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';

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
	for (const crew of req.credits.crew) {
		if(!people.includes(crew.id)) return;

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
		});

		// transaction.push(
		await	confDb.crew.upsert({
				where: {
					creditId: crew.credit_id,
				},
				update: crewsInsert,
				create: crewsInsert,
			})
		// );

		crewArray.push({
			where: {
				creditId: crew.credit_id,
			},
			create: {
				creditId: crew.credit_id,
			},
		});
	}
};
