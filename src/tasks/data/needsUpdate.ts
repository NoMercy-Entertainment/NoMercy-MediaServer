import { writeFileSync } from 'fs';
import { movieChanges } from '../../providers/tmdb/movie/index';
import { tvChanges } from '../../providers/tmdb/tv/index';
import Logger from '../../functions/logger';
import { FolderInfo } from '../files/scanLibraries';

export const needsUpdate = async (data: FolderInfo) => {
	let daysCount = Math.round((Date.now() - data.lastUpdate) / 24 / 60 / 60 / 1000);

	data.lastUpdate = Date.now();
	writeFileSync(data.jsonFile, JSON.stringify(data, null, 4));

	let needsUpdate = false;
	if (daysCount > 14) {
		needsUpdate = true;
	} else if (daysCount == 0) {
		needsUpdate = false;
	} else {
		switch (data.type) {
			case 'tv':
				needsUpdate = (await tvChanges(data.id, daysCount)).length > 0;
				break;
			case 'movie':
				needsUpdate = (await movieChanges(data.id, daysCount)).length > 0;
				break;
			case 'music':
				needsUpdate = false;
				break;

			default:
				needsUpdate = false;
				break;
		}
	}

	if (needsUpdate) {
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Refreshing ${data.type} with id: ${data.id}`,
		});
	} else {
		
		Logger.log({
			level: 'info',
			name: 'App',
			color: 'magentaBright',
			message: `Nothing to update for ${data.type} with id ${data.id}`,
		});
	}

	return needsUpdate;
};

export default needsUpdate;