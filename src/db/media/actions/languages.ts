import { InferModel } from 'drizzle-orm';

import { convertBooleans } from '@server/db/helpers';
import { languages } from '../schema/languages';

export type NewLanguage = InferModel<typeof languages, 'insert'>;
export const insertLanguage = (data: NewLanguage) => globalThis.mediaDb.insert(languages)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: languages.iso_639_1,
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Language = InferModel<typeof languages, 'select'>;
export const selectLanguage = (relations = false) => {
	if (relations) {
		return globalThis.mediaDb.query.languages.findMany({
			with: {
				language_library: true,
			},
		});
	}
	return globalThis.mediaDb.select()
		.from(languages)
		.all();
};
