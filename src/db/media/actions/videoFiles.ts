import { InferModel, eq } from 'drizzle-orm';
import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { videoFiles } from '../schema/videoFiles';
import { RequireOnlyOne } from '@server/types/helpers';
import { NewMediaAttachment } from './mediaAttachments';
import { NewMediaStream } from './mediaStreams';

export type NewVideoFile = InferModel<typeof videoFiles, 'insert'>;
export const insertVideoFileDB = (data: NewVideoFile) => globalThis.mediaDb.insert(videoFiles)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [videoFiles.filename],
		set: convertBooleans(data, true),
	})
	.returning()
	.get();


export type VideoFile = InferModel<typeof videoFiles, 'select'>;
export type VideoFileWithRelations = VideoFile & { MediaAttachments: NewMediaAttachment; Mediastreams: NewMediaStream; };

type SelectVideoFile = RequireOnlyOne<{ id: string; movie_id: number, episode_id: number }>
export const getVideoFilesDB = (data: SelectVideoFile, relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.videoFiles.findMany({
			with: {
				episode: true,
				movie: true,
			},
			where: (videoFiles, { eq }) => eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]),
		});
	}
	return globalThis.mediaDb.select()
		.from(videoFiles)
		.where(eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]))
		.all();
};
export const getVideoFileDB = (data: SelectVideoFile, relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.videoFiles.findFirst({
			with: {
				episode: true,
				movie: true,
			},
			where: (videoFiles, { eq }) => eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]),
		});
	}
	return globalThis.mediaDb.select()
		.from(videoFiles)
		.where(eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]))
		.all();
};
