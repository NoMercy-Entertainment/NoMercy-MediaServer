import { GuestStar, insertGuestStar } from '@server/db/media/actions/guestStars';
import { unique } from '@server/functions/stringArray';
import { EpisodeAppend } from '@server/providers/tmdb/episode/index';
import { insertGuestRole } from '@server/db/media/actions/roles';
import Logger from '@server/functions/logger/logger';

export default (
	episode: EpisodeAppend,
	guestStarArray: Array<GuestStar>,
	people: number[]
) => {
	for (const guest_star of unique(episode.credits.guest_stars, 'credit_id')) {
		if (!people.includes(guest_star.id)) continue;

		try {

			insertGuestStar({
				id: guest_star.credit_id,
				person_id: guest_star.id,
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
		try {

			insertGuestRole({
				guest_id: guest_star.credit_id,
				character: guest_star.character,
				credit_id: guest_star.credit_id,
			});

		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}

		// if (guest_star.profile_path) {
		// 	downloadAndHash({
		// 		src: guest_star.profile_path,
		// 		table: 'person',
		// 		column: 'profile',
		// 		type: 'profile',
		// 		only: ['colorPalette', 'blurHash'],
		// 	});
		// }
	}
};
