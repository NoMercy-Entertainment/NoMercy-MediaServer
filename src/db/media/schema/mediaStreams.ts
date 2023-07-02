import { text, sqliteTable, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { files } from './files';

export const mediaStreams = sqliteTable('mediaStreams', {
	id: text('id'),
	streamIndex: integer('streamIndex'),
	streamType: text('streamType'),
	codec: text('codec'),
	language: text('language'),
	channelLayout: text('channelLayout'),
	profile: text('profile'),
	aspectRatio: text('aspectRatio'),
	path: text('path'),
	isIntrlaced: integer('isIntrlaced'),
	bitRate: integer('bitRate'),
	channels: integer('channels'),
	sampleRate: integer('sampleRate'),
	isDefault: integer('isDefault'),
	isForced: integer('isForced'),
	isExternal: integer('isExternal'),
	height: integer('height'),
	width: integer('width'),
	averageFrameRate: integer('averageFrameRate'),
	realFrameRate: integer('realFrameRate'),
	level: integer('level'),
	pixelFormat: text('pixelFormat'),
	bitDepth: integer('bitDepth'),
	isAnamorphic: integer('isAnamorphic'),
	refFrames: integer('refFrames'),
	codecTag: text('codecTag'),
	comment: text('comment'),
	nalLengthSize: text('nalLengthSize'),
	isAvc: integer('isAvc'),
	title: text('title'),
	timeBase: text('timeBase'),
	codecTimeBase: text('codecTimeBase'),
	colorPrimaries: text('colorPrimaries'),
	colorSpace: text('colorSpace'),
	colorTransfer: text('colorTransfer'),
	dvVersionMajor: integer('dvVersionMajor'),
	dvVersionMinor: integer('dvVersionMinor'),
	dvProfile: integer('dvProfile'),
	dvLevel: integer('dvLevel'),
	rpuPresentFlag: integer('rpuPresentFlag'),
	elPresentFlag: integer('elPresentFlag'),
	blPresentFlag: integer('blPresentFlag'),
	dvBlSignalCompatibility_id: integer('dvBlSignalCompatibility_id'),
	keyFrames: text('keyFrames'),

	created_at: text('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	file_id: text('file_id')
		.references(() => files.id, { onDelete: 'cascade', onUpdate: 'cascade' })
		.notNull(),

}, db => ({
	pk: primaryKey(db.id),
	index: index('mediastreams_index').on(db.id, db.streamIndex),
	unqiue: index('mediastreams_unique').on(db.file_id, db.streamIndex),
}));

export const mediaStreamsRelations = relations(mediaStreams, ({ one }) => ({
	file: one(files, {
		fields: [mediaStreams.file_id],
		references: [files.id],
	}),
}));
