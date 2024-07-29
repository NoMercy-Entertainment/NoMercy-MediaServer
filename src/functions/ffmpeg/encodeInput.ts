import { EP } from '@server/tasks/files/filenameParser';
import { FFMpegArchive } from './archiver';

export const encodeEpisode = async ({ episode }: { episode: EP }) => {

	const onDemand = new FFMpegArchive();

	await onDemand.fromDatabase(episode);

	onDemand
		.verifyHLS();

	await onDemand.makeStack();
	// onDemand.check();
	await onDemand.start(async () => {
		onDemand.buildSprite();
		await onDemand.makeSubtitles();
		await onDemand.addToDatabase();

		process?.send?.({
        	type: 'custom',
        	event: 'update_content',
        	data: ['library'],
		});
	});
};
