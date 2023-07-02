import { AppState, useSelector } from '@/state/redux';
import getTVDBImages from './getTVDBImages';

import { CompleteMovieAggregate } from '../../tasks/data/fetchMovie';
import { CompleteTvAggregate } from '../../tasks/data/fetchTvShow';
import Logger from '../../functions/logger';
import downloadImage from '../../functions/downloadImage/downloadImage';
import { imagesPath } from '@/state';
import path from 'path';
import { insertImage } from '@/db/media/actions/images';
import { insertCast } from '@/db/media/actions/casts';

interface DownloadTVDBImages {
	type: 'tv' | 'movie';
	data: (CompleteMovieAggregate | CompleteTvAggregate) & { task?: { id: string } };
}

export const execute = ({ type, data }: DownloadTVDBImages) => {

	return new Promise<void>(async (resolve, reject) => {

		try {
			Logger.log({
				level: 'info',
				name: 'App',
				color: 'magentaBright',
				message: 'Fetching character images',
			});

			const newType = type == 'tv'
				? 'series'
				: 'movies';
			const imageData = await getTVDBImages(
				newType,
				data
			);

			for (let i = 0; i < imageData.length; i++) {
				const image = imageData[i];
				const file = `${imagesPath}/cast/${image.profile_path?.replace('.jpg', '.webp')}`;

				// if (existsSync(`${imagesPath}/cast/${image.credit_id}.webp`)) continue;

				await downloadImage({
					url: image.img,
					path: path.resolve(`${imagesPath}/cast/${image.credit_id}.webp`),
				})
					// eslint-disable-next-line no-loop-func
					.then(({ dimensions, stats, colorPalette, blurHash }) => {
						try {

							insertImage({
								filePath: `/${image.credit_id}.jpg`,
								aspectRatio: dimensions.width && dimensions.height
									? (dimensions.width / dimensions.height)
									: 0.6666666666666666,
								site: 'thetvdb.com',
								iso6391: 'xx',
								height: dimensions.height,
								width: dimensions.width,
								type: dimensions.type,
								size: stats.size,
								name: `${image.credit_id}.jpg`,
								colorPalette: colorPalette
									? JSON.stringify(colorPalette)
									: null,
								blurHash: blurHash,
							});
						} catch (error) {
							Logger.log({
								level: 'error',
								name: 'App',
								color: 'red',
								message: JSON.stringify(['tvdb image', error]),
							});
						}

						try {
							insertCast({
								id: image.credit_id,
								person_id: image.id,
								[`${type}_id`]: data.id,
							});

						} catch (error) {
							Logger.log({
								level: 'error',
								name: 'App',
								color: 'red',
								message: JSON.stringify(['tvdb image cast', error]),
							});
						}

					})
					.catch(console.log);
			}

			Logger.log({
				level: 'verbose',
				name: 'App',
				color: 'magentaBright',
				message: 'Fetching images complete',
			});

			resolve();
		} catch (error) {
			Logger.log({
				level: 'error',
				name: 'App',
				color: 'red',
				message: JSON.stringify(['tvdb images', error]),
			});
			reject(error);
		}
	});
};

export const downloadTVDBImages = ({ type, data }: DownloadTVDBImages) => {
	const queue = useSelector((state: AppState) => state.config.dataWorker);

	queue.add({
		file: __filename,
		fn: 'execute',
		args: { type, data },
	});
};

export default downloadTVDBImages;
