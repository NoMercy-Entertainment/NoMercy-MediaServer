import { InferModel } from 'drizzle-orm';
import { mediaDb } from '@server/db/media';
import { convertBooleans } from '@server/db/helpers';
import { mediaAttachments } from '../schema/mediaAttachments';
import { createId } from '@paralleldrive/cuid2';

export type NewMediaAttachment = InferModel<typeof mediaAttachments, 'insert'>;
export const insertMediaAttachment = (data: NewMediaAttachment) => mediaDb.insert(mediaAttachments)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: mediaAttachments.type,
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

export type MediaAttachment = InferModel<typeof mediaAttachments, 'select'>;
export const selectMediaAttachment = () => {
	return mediaDb.select()
		.from(mediaAttachments)
		.all();
};
