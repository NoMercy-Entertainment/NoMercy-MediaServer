import { convertBooleans } from '../../helpers';
import { asc, InferModel } from 'drizzle-orm';

import { createId } from '@paralleldrive/cuid2';
import { libraries } from '../schema/libraries';
import { isOwner } from '@server/api/middleware/permissions';
import { Request } from 'express-serve-static-core';

export type NewLibrary = InferModel<typeof libraries, 'insert'>;
export const insertLibrary = (data: NewLibrary, constraint: 'id' | 'title') =>
	globalThis.mediaDb.insert(libraries)
		.values({
			...convertBooleans(data),
			id: data.id ?? createId(),
		})
		.onConflictDoUpdate({
			target: libraries[constraint],
			set: {
				...convertBooleans(data, true),
			},
		})
		.returning()
		.get();

export type Library = InferModel<typeof libraries, 'select'>;
export const selectLibrary = () => {
	return globalThis.mediaDb.select()
		.from(libraries)
		.all();
};

export type LibrariesWithRelations = ReturnType<typeof selectLibrariesWithRelations>;
export const selectLibrariesWithRelations = () => {
	return globalThis.mediaDb.query.libraries.findMany({
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
		orderBy: asc(libraries.order),
	});
};

export type LibraryWithRelations = ReturnType<typeof selectLibraryWithRelations>;
export const selectLibraryWithRelations = (id: string) => {
	return globalThis.mediaDb.query.libraries.findFirst({
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
		where: (libraries, { eq }) => eq(libraries.id, id),
		orderBy: asc(libraries.order),
	});
};

export type AllowedLibraries = ReturnType<typeof getAllowedLibraries>;
export const getAllowedLibraries = (req: Request | string) => {

	if (isOwner(req)) {
		return globalThis.mediaDb.query.libraries.findMany({
			orderBy: asc(libraries.order),
		})
			.map(l => l.id!);
	}

	if (typeof req == 'string') {
		return globalThis.mediaDb.query.library_user.findMany({
			where: (library_user, { eq }) => eq(library_user.user_id, req),
		})
			.map(l => l.library_id!);
	}

	return globalThis.mediaDb.query.library_user.findMany({
		where: (library_user, { eq }) => eq(library_user.user_id, req.user.sub),
	})
		.map(l => l.library_id!);
};
export type AllowedLibrary = ReturnType<typeof getAllowedLibrary>;
export const getAllowedLibrary = (req: Request | string, id: string) => {

	if (isOwner(req)) {
		return globalThis.mediaDb.query.libraries.findMany({
			orderBy: asc(libraries.order),
		})
			.map(l => l.id!);
	}

	if (typeof req == 'string') {
		return globalThis.mediaDb.query.library_user.findMany({
			where: (library_user, {
				eq,
				and,
			}) => and(
				eq(library_user.user_id, req),
				eq(library_user.library_id, id)
			),
		})
			.map(l => l.library_id!);
	}

	return globalThis.mediaDb.query.library_user.findMany({
		where: (library_user, { eq }) => eq(library_user.user_id, req.user.sub),
	})
		.map(l => l.library_id!);
};

export const getLibrary = (req: Request, id: string) => {

	if (req.isOwner) {
		return globalThis.mediaDb.query.libraries.findFirst({
			where: (libraries, { eq }) => eq(libraries.id, id),
		});
	}

	return globalThis.mediaDb.query.library_user.findFirst({
		where: (library_user, {
			eq,
			and,
		}) => and(
			eq(library_user.library_id, id),
			eq(library_user.user_id, req.user.sub)
		),
		with: {
			library: true,
		},
	})?.library;
};

export type EncodingLibrary = ReturnType<typeof getEncoderLibraryById>;

export const getEncoderLibraryById = (id: string) => {
	return globalThis.mediaDb.query.libraries.findFirst({
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
		where: (libraries, { eq }) => eq(libraries.id, id),
		orderBy: asc(libraries.order),
	})!;
};

export const getEncoderLibraryByType = (type: string) => {
	return globalThis.mediaDb.query.libraries.findFirst({
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
		where: (libraries, { eq }) => eq(libraries.type, type),
		orderBy: asc(libraries.order),
	});
};

export const getEncoderLibraries = () => {
	return globalThis.mediaDb.query.libraries.findMany({
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
		orderBy: asc(libraries.order),
	});
};
