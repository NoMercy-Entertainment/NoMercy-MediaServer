import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '../../helpers';
import { messages } from '../schema/messages';
import { createId } from '@paralleldrive/cuid2';

export type NewMessage = InferModel<typeof messages, 'insert'>;
export const insertMessage = (data: NewMessage) => globalThis.mediaDb.insert(messages)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.returning()
	.get();

export type Message = InferModel<typeof messages, 'select'>;
export const selectMessage = () => {
	return globalThis.mediaDb.select()
		.from(messages)
		.all();
};
