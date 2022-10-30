import { CompleteTvAggregate } from './fetchTvShow';
import Logger from '../../functions/logger';
import { Prisma } from '@prisma/client'
import cast from './cast';
import { confDb } from '../../database/config';
import crew from './crew';
import downloadTMDBImages from '../images/downloadTMDBImages';
import episode from './episode';
import image from './image';
import translation from './translation';

const season = async (
	tv: CompleteTvAggregate,
	transaction: Prisma.PromiseReturnType<any>[],
	people: number[],
) => {

	// Logger.log({
	// 	level: 'info',
	// 	name: 'App',
	// 	color: 'magentaBright',
	// 	message: `Adding seasons for TV Show: ${(tv as CompleteTvAggregate).name}`,
	// });

	for (let i = 0; i < tv.seasons.length; i++) {
		const season = tv.seasons[i];
		if(!season.id) continue;

		const castInsert: any[] = [];
		const crewInsert: any[] = [];

		await cast(season, transaction, castInsert, people);
		await crew(season, transaction, crewInsert, people);

		const seasonsInsert = Prisma.validator<Prisma.SeasonCreateInput>()({
			airDate: season.air_date,
			id: season.id,
			overview: season.overview,
			poster: season.poster_path,
			seasonNumber: season.season_number,
			title: season.name,
			episodeCount: season.episode_count,
			Tv: {
				connect:{
					id: tv.id
				}
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

		await translation(season, transaction, 'season');

		await downloadTMDBImages('season', season).catch(() => null);

		await image(season, transaction, 'backdrop', 'season');
		await image(season, transaction, 'poster', 'season');

		await episode(tv.id, season, transaction, people);
	
	}
	
	// Logger.log({
	// 	level: 'info',
	// 	name: 'App',
	// 	color: 'magentaBright',
	// 	message: `Seasons for TV Show: ${(tv as CompleteTvAggregate).name} added successfully`,
	// });
};

export default season;
