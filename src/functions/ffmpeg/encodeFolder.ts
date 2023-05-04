import { AppState, useSelector } from '@/state/redux';

import { FFMpegArchive } from './archiver';
import { confDb } from '@/database/config';
import { readdirSync } from 'fs';

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
		instance.emit('message', message);
	});

	await instance.start(async () => {
		instance.buildSprite();
		await instance.addToDatabase();
		process.send!({
			type: 'encoder-end',
			id: instance.index,
		});
	});

};

export const encodeFolder = async ({ folder, libraryId }) => {

	const library = await confDb.library.findFirst({
		where: {
			id: libraryId,
		},
		include: {
			EncoderProfiles: {
				include: {
					EncoderProfile: true,
				},
			},
			Folders: {
				include: {
					folder: true,
				},
			},
		},
	});

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
				.verifyHLS()
				.makeStack();

			await queue.add({
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

	const library = await confDb.library.findFirst({
		where: {
			id: libraryId,
		},
		include: {
			EncoderProfiles: {
				include: {
					EncoderProfile: true,
				},
			},
			Folders: {
				include: {
					folder: true,
				},
			},
		},
	});

	const queue = useSelector((state: AppState) => state.config.queueWorker);
	try {
		const onDemand = new FFMpegArchive();

		onDemand.setLibrary(library!);
		await onDemand.fromFile(path);

		onDemand
			.verifyHLS()
			.makeStack();

		await queue.add({
			file: __filename,
			fn: 'execute',
			args: { onDemand },
		});

	} catch (error) {
		console.error(error);
	}
};
