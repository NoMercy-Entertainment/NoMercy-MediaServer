import { image } from '../shared/image';

import { CompleteTvAggregate } from './fetchTvShow';
import Logger from '@server/functions/logger';
// import aggregateCast from './aggregateCast';
// import aggregateCrew from './aggregateCrew';
import episode from './episode';
import translation from '../shared/translation';
import { insertSeason } from '@server/db/media/actions/seasons';
// import createBlurHash from '@server/functions/createBlurHash/createBlurHash';
import colorPalette from '@server/functions/colorPalette/colorPalette';
import aggregateCast from './aggregateCast';
import aggregateCrew from './aggregateCrew';
import { Cast } from '@server/db/media/actions/casts';
import { Crew } from '@server/db/media/actions/crews';

const season = async (
	tv: CompleteTvAggregate,
	transaction: any[],
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

		const castInsert: Array<Cast> = [];
		const crewInsert: Array<Crew> = [];

		const palette: any = {
			poster: undefined,
		};

		const blurHash: any = {
			poster: undefined,
		};

		await Promise.all([
			// season.poster_path && createBlurHash(`https://image.tmdb.org/t/p/w185${season.poster_path}`).then((hash) => {
			// 	blurHash.poster = hash;
			// }),
			season.poster_path && colorPalette(`https://image.tmdb.org/t/p/w185${season.poster_path}`).then((hash) => {
				palette.poster = hash;
			}),
		]);

		try {
			insertSeason({
				airDate: season.air_date,
				id: season.id,
				overview: season.overview,
				poster: season.poster_path,
				seasonNumber: season.season_number,
				title: season.name,
				episodeCount: season.episode_count,
				blurHash: JSON.stringify(blurHash),
				colorPalette: JSON.stringify(palette),
				tv_id: tv.id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
			process.exit(1);
		}

		aggregateCast(season, castInsert, people, 'season');
		aggregateCrew(season, crewInsert, people, 'season');

		await episode(tv.id, season, transaction, people);

		translation(season, transaction, 'season');
		image(season, transaction, 'poster', 'season');

		// if (season.poster_path) {
		// 	downloadAndHash({
		// 		src: season.poster_path,
		// 		table: 'season',
		// 		column: 'poster',
		// 		type: 'season',
		// 	});
		// }
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Seasons for TV Show: ${(tv as CompleteTvAggregate).name} added successfully`,
	});
};

export default season;
