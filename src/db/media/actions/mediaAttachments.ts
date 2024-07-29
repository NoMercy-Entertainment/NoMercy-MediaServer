import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { mediaAttachments } from '../schema/mediaAttachments';
import { createId } from '@paralleldrive/cuid2';

export type NewMediaAttachment = InferModel<typeof mediaAttachments, 'insert'>;
export const insertMediaAttachment = (data: NewMediaAttachment) => globalThis.mediaDb.insert(mediaAttachments)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: mediaAttachments.type,
		set: {
			...convertBooleans(data, true),
			id: data.id ?? undefined,
		},
	})
	.returning()
	.get();

export type MediaAttachment = InferModel<typeof mediaAttachments, 'select'>;
export const selectMediaAttachment = () => {
	return globalThis.mediaDb.select()
		.from(mediaAttachments)
		.all();
};
