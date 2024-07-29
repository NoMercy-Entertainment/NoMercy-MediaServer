
import Logger from '@server/functions/logger';
import { AppState, useSelector } from '@server/state/redux';

import movieFiles from './movieFiles';
import tvFiles from './tvFiles';

export const execute = async ({ data, folder, libraryId, type }) => {

	Logger.log({
		level: 'info',
		name: 'App',
		color: 'magentaBright',
		message: `Finding all usable files for: ${data.title ?? data.name}`,
	});

	if (folder) {
		if (type === 'movie') {
			await movieFiles({ data, folder, libraryId });
		} else {
			await tvFiles({ data, folder, libraryId });
		}
	}

	return {
		success: true,
	};
};

const findMediaFiles = ({ data, folder, libraryId, type, sync = false }) => {
	if (sync) {
		return execute({ data, folder, libraryId, type });
	}
	const queue = useSelector((state: AppState) => state.config.queueWorker);

	queue.add({
		file: __filename,
		fn: 'execute',
		args: { data, folder, libraryId, type },
	});
};

export default findMediaFiles;
