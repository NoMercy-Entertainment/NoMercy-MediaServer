import { AppState, useSelector } from '@/state/redux';

import { FFMpegArchive } from './archiver';
import { readdirSync } from 'fs';
import { getEncoderLibraryById } from '@/db/media/actions/libraries';

export const execute = async ({ onDemand }: { onDemand: FFMpegArchive}) => {

	const instance = new FFMpegArchive(onDemand);
	// instance.check();

	instance.on('progress', (data: any) => {
		process.send!({
			type: 'encoder-progress',
			data,
		});
	});
	instance.on('paused', (data: any) => {
		process.send!({
			type: 'encoder-paused',
			data,
		});
	});
	instance.on('resumed', (data: any) => {
		process.send!({
			type: 'encoder-resumed',
			data,
		});
	});

	process.on('message', (message: any) => {
		// console.log(message);
		instance.emit('message', message);
	});

	console.log('starting');

	await instance.start(async () => {
		instance.buildSprite();
		instance.makeSubtitles();
		await instance.addToDatabase();
		process.send!({
			type: 'encoder-end',
			id: instance.index,
		});
	});

};

export const encodeFolder = async ({ folder, libraryId }) => {

	const library = getEncoderLibraryById(libraryId);

	const episodes = readdirSync(folder)
		.map((f) => {
			return {
				path: `${folder}/${f}`,
			};
		})
		.filter(f => f.path.endsWith('.mkv'));

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	for (const episode of episodes) {
		try {
			const onDemand = new FFMpegArchive();

			onDemand.setLibrary(library!);
			await onDemand.fromFile(episode.path);

			onDemand
				.setAllowedLanguages()
				.verifyHLS();

			await onDemand.makeStack();

			queue.add({
				file: __filename,
				fn: 'execute',
				args: { onDemand },
			});

		} catch (error) {
			console.error(error);
		}
	}
};

export const encodeFile = async ({ path, libraryId }) => {

	const library = getEncoderLibraryById(libraryId);

	const queue = useSelector((state: AppState) => state.config.encoderWorker);
	try {
		const onDemand = new FFMpegArchive();

		onDemand.setLibrary(library!);
		await onDemand.fromFile(path);

		await onDemand.makeStack();

		queue.add({
			file: __filename,
			fn: 'execute',
			args: { onDemand },
		});

	} catch (error) {
		console.error(error);
	}
};
