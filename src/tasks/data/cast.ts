import { confDb } from '../../database/config';
import { Prisma } from '@prisma/client'
import { EpisodeAppend } from '../../providers/tmdb/episode/index';
import { SeasonAppend } from '../../providers/tmdb/season/index';
import { CompleteTvAggregate } from './fetchTvShow';
import { CompleteMovieAggregate } from './fetchMovie';

export default async (
	req: CompleteTvAggregate | SeasonAppend | EpisodeAppend | CompleteMovieAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	castArray: Array<
		Prisma.CastMovieCreateOrConnectWithoutMovieInput
		| Prisma.CastTvCreateOrConnectWithoutTvInput
		| Prisma.CastSeasonCreateOrConnectWithoutSeasonInput
		| Prisma.CastEpisodeCreateOrConnectWithoutEpisodeInput
	>,
	people: number[]
) => {
	for (const cast of req.credits.cast) {
		if(!people.includes(cast.id)) return;

		const castsInsert = Prisma.validator<Prisma.CastUncheckedCreateInput>()({
			id: cast.credit_id,
			personId: cast.id,
			adult: cast.adult,
			character: cast.character,
			creditId: cast.credit_id,
			gender: cast.gender,
			knownForDepartment: cast.known_for_department,
			name: cast.name,
			order: cast.order,
			originalName: cast.original_name,
			popularity: cast.popularity,
			profilePath: cast.profile_path,
		});

		// transaction.push(
		await	confDb.cast.upsert({
				where: {
					creditId: cast.credit_id,
				},
				update: castsInsert,
				create: castsInsert,
			})
		// );

		castArray.push({
			where: {
				creditId: cast.credit_id,
			},
			create: {
				creditId: cast.credit_id,
			},
		});
	}
};
