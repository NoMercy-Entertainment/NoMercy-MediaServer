import { text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { libraries } from './libraries';
import { encoderProfiles } from './encoderProfiles';
import { relations } from 'drizzle-orm';

export const encoderProfile_library = sqliteTable('encoderProfile_library', {
	encoderProfile_id: text('encoderProfile_id')
		.references(() => encoderProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
	library_id: text('library_id')
		.references(() => libraries.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),
}, db => ({
	pk: primaryKey(db.encoderProfile_id, db.library_id),
}));

export const encoderProfile_libraryRelations = relations(encoderProfile_library, ({ one }) => ({
	encoderProfile: one(encoderProfiles, {
		fields: [encoderProfile_library.encoderProfile_id],
		references: [encoderProfiles.id],
	}),
	library: one(libraries, {
		fields: [encoderProfile_library.library_id],
		references: [libraries.id],
	}),
}));
