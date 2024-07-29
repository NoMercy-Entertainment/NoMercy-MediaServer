import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { createId } from '@paralleldrive/cuid2';
import { mediaStreams } from '../schema/mediaStreams';

export type NewMediaStream = InferModel<typeof mediaStreams, 'insert'>;
export const insertMediaStream = (data: NewMediaStream) => globalThis.mediaDb.insert(mediaStreams)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: [mediaStreams.file_id, mediaStreams.streamIndex],
		set: {
			...convertBooleans(data, true),
			id: data.id ?? undefined,
		},
	})
	.returning()
	.get();

export type MediaStream = InferModel<typeof mediaStreams, 'select'>;
export const selectMediaStream = () => {
	return globalThis.mediaDb.select()
		.from(mediaStreams)
		.all();
};
