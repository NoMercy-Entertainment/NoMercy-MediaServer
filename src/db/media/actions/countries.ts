import { convertBooleans } from '@server/db/helpers';
import { InferModel } from 'drizzle-orm';

import { countries } from '../schema/countries';

export type NewCountry = InferModel<typeof countries, 'insert'>;
export const insertCountry = (data: NewCountry) => globalThis.mediaDb.insert(countries)
	.values(convertBooleans(data))
	.onConflictDoUpdate({
		target: countries.iso31661,
		set: convertBooleans(data),
	})
	.returning()
	.get();

export type Country = InferModel<typeof countries, 'select'>;
export const selectCountry = () => {
	return globalThis.mediaDb.select()
		.from(countries)
		.all();
};
