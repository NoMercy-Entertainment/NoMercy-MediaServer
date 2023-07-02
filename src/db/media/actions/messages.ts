import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '../../helpers';
import { mediaDb } from '@/db/media';
import { messages } from '../schema/messages';
import { createId } from '@paralleldrive/cuid2';

export type NewMessage = InferModel<typeof messages, 'insert'>;
export const insertMessage = (data: NewMessage) => mediaDb.insert(messages)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.returning()
	.get();

export type Message = InferModel<typeof messages, 'select'>;
export const selectMessage = () => {
	return mediaDb.select()
		.from(messages)
		.all();
};
