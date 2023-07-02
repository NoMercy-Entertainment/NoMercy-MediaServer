import { image } from './image';

import { CombinedSeasons } from './fetchTvShow';
import Logger from '../../functions/logger';
import { Prisma } from '../../database/config/client';
import guest_star from './guest_star';
import translation from './translation';
import createBlurHash from '@/functions/createBlurHash/createBlurHash';
import colorPalette from '@/functions/colorPalette/colorPalette';
import { insertEpisodeDB } from '@/db/media/actions/episodes';
import { insertMedia } from '@/db/media/actions/medias';
import cast from './cast';
import crew from './crew';

const episode = async (
	id: number,
	season: CombinedSeasons,
	transaction: Prisma.PromiseReturnType<any>[],
	people: number[]
) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Adding episodes for season: ${season.season_number}`,
	});

	for (const episode of season.episodes) {
		if (!episode.id) continue;

		const guestStarInsert: Array<Prisma.GuestStarCreateOrConnectWithoutEpisodeInput> = [];
		const castInsert: Array<Prisma.CastCreateOrConnectWithoutEpisodeInput> = [];
		const crewInsert: Array<Prisma.CrewCreateOrConnectWithoutEpisodeInput> = [];

		const palette: any = {
			still: undefined,
		};

		const blurHash: any = {
			still: undefined,
		};

		await Promise.all([
			episode.still_path && createBlurHash(`https://image.tmdb.org/t/p/w185${episode.still_path}`).then((hash) => {
				blurHash.still = hash;
			}),
			episode.still_path && colorPalette(`https://image.tmdb.org/t/p/w185${episode.still_path}`).then((hash) => {
				palette.still = hash;
			}),
		]);

		try {
			insertEpisodeDB({
				airDate: episode.air_date,
				episodeNumber: episode.episode_number,
				id: episode.id,
				title: episode.name,
				overview: episode.overview,
				productionCode: episode.production_code,
				seasonNumber: episode.season_number,
				still: episode.still_path,
				voteAverage: episode.vote_average,
				voteCount: episode.vote_count,
				imdbId: episode?.external_ids.imdb_id,
				blurHash: JSON.stringify(blurHash),
				colorPalette: JSON.stringify(palette),
				season_id: season.id,
				tv_id: id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}

		guest_star(episode, guestStarInsert, people);
		cast(episode, castInsert, people, 'episode');
		crew(episode, crewInsert, people, 'episode');

		if (episode?.still_path != '' && episode.still_path != null) {
			try {
				insertMedia({
					src: episode.still_path,
					type: 'still',
					episode_id: episode.id,
				});
			} catch (error) {
				Logger.log({
					level: 'error',
					name: 'App',
					color: 'red',
					message: JSON.stringify([`${__filename}`, error]),
				});
			}

		}

		translation(episode, transaction, 'episode');
		image(episode, transaction, 'still', 'episode');

		// if (episode.still_path) {
		// 	 downloadAndHash({
		// 		src: episode.still_path,
		// 		table: 'episode',
		// 		column: 'still',
		// 		type: 'episode',
		// 	});
		// }
	}

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Episodes for season: ${season.season_number} added successfully`,
	});
};

export default episode;
