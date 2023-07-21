import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { mediaStreams } from '../schema/mediaStreams';

export type NewMediaStream = InferModel<typeof mediaStreams, 'insert'>;
export const insertMediaStream = (data: NewMediaStream) => mediaDb.insert(mediaStreams)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [mediaStreams.file_id, mediaStreams.streamIndex],
		set: {
			...convertBooleans(data),
			id: data.id ?? undefined,
			updated_at: new Date().toISOString()
				.slice(0, 19)
				.replace('T', ' '),
		},
	})
	.returning()
	.get();

export type MediaStream = InferModel<typeof mediaStreams, 'select'>;
export const selectMediaStream = () => {
	return mediaDb.select()
		.from(mediaStreams)
		.all();
};
