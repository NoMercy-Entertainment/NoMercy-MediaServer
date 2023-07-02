import { mediaDb } from '@/db/media';
import { InferModel } from 'drizzle-orm';
import { convertBooleans } from '@/db/helpers';
import { language_library } from '../schema/language_library';

export type LanguageLibrary = InferModel<typeof language_library, 'insert'>;
export const insertSubtitleLanguage = (data: LanguageLibrary) => mediaDb.insert(language_library)
	.values({
		...convertBooleans(data),
	})
	.onConflictDoUpdate({
		target: [language_library.language_id, language_library.library_id],
		set: {
			...convertBooleans(data),
		},
	})
	.returning()
	.get();

export type SubtitleLanguage = InferModel<typeof language_library, 'select'>;
export const selectSubtitleLanguage = () => {
	return mediaDb.select()
		.from(language_library)
		.all();
};
