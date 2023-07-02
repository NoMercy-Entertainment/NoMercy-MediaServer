import { InferModel, eq } from 'drizzle-orm';
import { mediaDb } from '@/db/media';
import { convertBooleans } from '@/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { videoFiles } from '../schema/videoFiles';
import { RequireOnlyOne } from '@/types/helpers';
import { NewMediaAttachment } from './mediaAttachments';
import { NewMediaStream } from './mediaStreams';

export type NewVideoFile = InferModel<typeof videoFiles, 'insert'>;
export const insertVideoFileDB = (data: NewVideoFile) => mediaDb.insert(videoFiles)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [videoFiles.filename],
		set: {
			...convertBooleans(data),
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();


export type VideoFile = InferModel<typeof videoFiles, 'select'>;
export type VideoFileWithRelations = VideoFile & { MediaAttachments: NewMediaAttachment; Mediastreams: NewMediaStream; };

type SelectVideoFile = RequireOnlyOne<{ id: string; movie_id: number, episode_id: number }>
export const getVideoFilesDB = (data: SelectVideoFile, relations = false) => {
	if (relations) {
		return mediaDb.query.videoFiles.findMany({
			with: {
				episode: true,
				movie: true,
			},
			where: (videoFiles, { eq }) => eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]),
		}) as unknown as VideoFileWithRelations[];
	}
	return mediaDb.select()
		.from(videoFiles)
		.where(eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]))
		.all();
};
export const getVideoFileDB = (data: SelectVideoFile, relations = false) => {
	if (relations) {
		return mediaDb.query.videoFiles.findFirst({
			with: {
				episode: true,
				movie: true,
			},
			where: (videoFiles, { eq }) => eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]),
		}) as unknown as VideoFileWithRelations;
	}
	return mediaDb.select()
		.from(videoFiles)
		.where(eq(videoFiles[`${Object(data).entries()[0]}`], Object(data).entries()[1]))
		.all();
};
