import Logger from '@server/functions/logger/logger';
import { CompleteTvAggregate } from './fetchTvShow';
import { insertCreator } from '@server/db/media/actions/creators';
import { Tv } from '@server/db/media/actions/tvs';

export default (
	req: CompleteTvAggregate,
	createdByArray: Array<Tv>,
	people: number[]
) => {

	for (const created_by of req.created_by) {

		if (!people.includes(created_by.id)) continue;

		try {
			insertCreator({
				person_id: created_by.id,
				tv_id: req.id,
			});
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify([`${__filename}`, error]),
			});
		}
		// if (created_by.profile_path) {
		// 	downloadAndHash({
		// 		src: created_by.profile_path,
		// 		table: 'person',
		// 		column: 'profile',
		// 		type: 'crew',
		// 		only: ['colorPalette', 'blurHash'],
		// 	});
		// }
	}
};
