import { confDb } from '../../database/config';
import { Prisma } from '../../database/config/client';
import Logger from '../../functions/logger';
import aggregateCast from './aggregateCast';
import aggregateCrew from './aggregateCrew';
import episode from './episode';
import { CompleteTvAggregate } from './fetchTvShow';
import { downloadAndHash, image } from './image';
import translation from './translation';

const season = async (
	tv: CompleteTvAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	people: number[]
) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding seasons for TV Show: ${(tv as CompleteTvAggregate).name}`,
	});

	for (let i = 0; i < tv.seasons.length; i++) {
		const season = tv.seasons[i];
		if (!season.id) continue;

		const castInsert: Array<Prisma.CastCreateOrConnectWithoutSeasonInput> = [];
		const crewInsert: Array<Prisma.CrewCreateOrConnectWithoutSeasonInput> = [];
		await aggregateCast(season, castInsert, people, 'season');
		await aggregateCrew(season, crewInsert, people, 'season');

		// @ts-ignore
		const seasonsInsert = Prisma.validator<Prisma.SeasonCreateInput>()({
			airDate: season.air_date,
			id: season.id,
			overview: season.overview,
			poster: season.poster_path,
			seasonNumber: season.season_number,
			title: season.name,
			episodeCount: season.episode_count,
			Tv: {
				connect: {
					id: tv.id,
				},
			},
			Cast: {
				connectOrCreate: castInsert,
			},
			Crew: {
				connectOrCreate: crewInsert,
			},
		});

		transaction.push(
			confDb.season.upsert({
				where: {
					id: season.id,
				},
				update: seasonsInsert,
				create: seasonsInsert,
			})
		);

		await episode(tv.id, season, transaction, people);

		translation(season, transaction, 'season');
		await image(season, transaction, 'poster', 'season');

		if (season.poster_path) {
			await downloadAndHash({
				src: season.poster_path,
				table: 'season',
				column: 'poster',
				type: 'season',
				only: ['blurHash'],
			});
		}
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Seasons for TV Show: ${(tv as CompleteTvAggregate).name} added successfully`,
	});
};

export default season;
