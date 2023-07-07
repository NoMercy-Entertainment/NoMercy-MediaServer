import { convertBooleans } from '../../helpers';
import { InferModel, and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { mediaDb } from '@/db/media';
import { libraries } from '../schema/libraries';
import { Request } from 'express';
import { library_user } from '../schema/library_user';
import { FolderLibrary } from './folder_library';
import { LanguageLibrary } from './language_library';
import { EncoderProfileLibrary } from './encoderProfile_library';
import { LibraryUser } from './library_user';
import { LibraryTv } from './library_tv';
import { LibraryMovie } from './library_movie';
import { User } from './users';
import { Folder } from './folders';
import { Language } from './languages';
import { EncoderProfile } from './encoderProfiles';

export type NewLibrary = InferModel<typeof libraries, 'insert'>;
export const insertLibrary = (data: NewLibrary, constraint: 'id' | 'title') => mediaDb.insert(libraries)
	.values({
		...convertBooleans(data),
		id: data.id ?? createId(),
	})
	.onConflictDoUpdate({
		target: libraries[constraint],
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

export type Library = InferModel<typeof libraries, 'select'>;
export const selectLibrary = () => {
	return mediaDb.select()
		.from(libraries)
		.all();
};

export type LibraryWithRelations = InferModel<typeof libraries, 'select'> & {
	language_library: (LanguageLibrary & {
		language: Language
	})[];
	encoderProfile_library: EncoderProfileLibrary[];
	library_user: (LibraryUser & {
		user: User
	})[];
	folder_library: (FolderLibrary & {
		folder: Folder
	})[];
	library_tv: LibraryTv[];
	library_movie: LibraryMovie[];
};
export const selectLibrariesWithRelations = (): LibraryWithRelations[] => {
	return mediaDb.query.libraries.findMany({
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			language_library: {
				with: {
					language: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
			library_user: {
				with: {
					user: true,
				},
			},
			library_tv: {
				with: {
					tv: true,
				},
			},
			library_movie: {
				with: {
					movie: true,
				},
			},
			collection_library: {
				with: {
					collection: true,
				},
			},
			artist_library: {
				with: {
					artist: true,
				},
			},
		},
	}) as unknown as LibraryWithRelations[];
};

export const selectLibraryWithRelations = (id: string): LibraryWithRelations => {
	return mediaDb.query.libraries.findFirst({
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			language_library: {
				with: {
					language: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
			library_user: {
				with: {
					user: true,
				},
			},
			library_tv: {
				with: {
					tv: true,
				},
			},
			library_movie: {
				with: {
					movie: true,
				},
			},
			collection_library: {
				with: {
					collection: true,
				},
			},
			artist_library: {
				with: {
					artist: true,
				},
			},
		},
		where: eq(libraries.id, id),
	}) as unknown as LibraryWithRelations;
};

export const getAllowedLibraries = (req: Request | string) => {

	if (typeof req == 'string') {
		return mediaDb.query.library_user.findMany({
			where: eq(library_user.user_id, req),
		}).map(l => l.library_id);
	}

	if (req.isOwner) {
		return mediaDb.query.libraries.findMany().map(l => l.id);
	}

	return mediaDb.query.library_user.findMany({
		where: eq(library_user.user_id, req.user.sub),
	}).map(l => l.library_id);
};

export const getLibrary = (req: Request, id: string) => {

	if (req.isOwner) {
		return mediaDb.query.libraries.findFirst({
			where: eq(libraries.id, id),
		}) as unknown as Library;
	}

	return mediaDb.query.library_user.findFirst({
		where: and(
			eq(library_user.library_id, id),
			eq(library_user.user_id, req.user.sub)
		),
		with: {
			library: true,
		},
	})?.library as unknown as Library;
};

export type EncodingLibrary = Library & {
	folder_library: (FolderLibrary & {
		folder: Folder;
	})[];
	encoderProfile_library: (EncoderProfileLibrary & {
		encoderProfile: EncoderProfile;
	})[];
};

export const getEncoderLibraryById = (id: string) => {
	return mediaDb.query.libraries.findFirst({
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
		},
		where: eq(libraries.id, id),
	}) as unknown as EncodingLibrary;
};

export const getEncoderLibraryByType = (type: string) => {
	return mediaDb.query.libraries.findFirst({
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
		},
		where: eq(libraries.type, type),
	}) as unknown as EncodingLibrary;
};

export const getEncoderLibraries = () => {
	return mediaDb.query.libraries.findMany({
		with: {
			folder_library: {
				with: {
					folder: true,
				},
			},
			encoderProfile_library: {
				with: {
					encoderProfile: true,
				},
			},
		},
	}) as unknown as EncodingLibrary[];
};
