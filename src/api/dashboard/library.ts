import { Request, Response } from 'express-serve-static-core';

import Logger from '@server/functions/logger';
import { createMediaFolder } from '@server/tasks/files/filenameParser';
import i18n from '../../loaders/i18n';
import { movie } from '@server/providers/tmdb/movie';
import { scanLibrary } from '@server/tasks/files/scanLibraries';
import storeMovie from '@server/tasks/data/movie';
import storeTvShow from '@server/tasks/data/tv';
import { tv } from '@server/providers/tmdb/tv';
import { insertLibrary, selectLibrariesWithRelations } from '@server/db/media/actions/libraries';
import { eq, inArray } from 'drizzle-orm';
import { libraries as dbLibraries } from '@server/db/media/schema/libraries';
import { folders } from '@server/db/media/schema/folders';
import { insertFolder } from '@server/db/media/actions/folders';
import { insertLibraryFolder } from '@server/db/media/actions/folder_library';
import path from 'path';
import { updateEncoderProfilesParams } from '@server/types/server';
import { insertEncoderProfileLibrary } from '@server/db/media/actions/encoderProfile_library';
import { insertSubtitleLanguage } from '@server/db/media/actions/language_library';
import { languages } from '@server/db/media/schema/languages';

export const libraries = (req: Request, res: Response) => {

	const data = selectLibrariesWithRelations();

	const lib = data.map((d) => {
		return {
			...d,
			extractChaptersDuring: d.extractChaptersDuring,
			language: d.language,
			country: d.country,
			folders: d.folder_library.map(f => f.folder?.path),
			subtitleLanguages: undefined,
			encoderProfiles: d.encoderProfile_library.map(e => e.encoderProfile_id),
			subtitles: d.language_library.map(s => s.language.iso_639_1),
			EncoderProfiles: undefined,
			SubtitleLanguages: undefined,
			Metadata: undefined,
			Folders: undefined,
		};
	});
	return res.json(lib);

};

export const createLibrary = (req: Request, res: Response) => {

	const libraries = globalThis.mediaDb.query.libraries.findMany();
	const library = insertLibrary({
		title: `Library ${libraries.length + 1}`,
		autoRefreshInterval: 30,
		chapterImages: true,
		extractChapters: true,
		extractChaptersDuring: true,
		perfectSubtitleMatch: true,
		realtime: true,
		specialSeasonName: 'Specials',
		type: '',
		country: '',
		language: '',
	}, 'id');

	return res.json({
		status: 'ok',
		data: library,
	});
};

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateLibrary = (req: Request, res: Response) => {
	const {
		id,
		autoRefreshInterval,
		image,
		perfectSubtitleMatch,
		realtime,
		specialSeasonName,
		title,
		encoderProfiles: E,
		folders: F,
		subtitles: S,
	}: updateEncoderProfilesParams = req.body;

	try {

		const library = globalThis.mediaDb.query.libraries.findFirst({
			where: eq(dbLibraries.id, id),
		})!;

		insertLibrary({
			...library,
			id,
			autoRefreshInterval,
			image,
			perfectSubtitleMatch,
			realtime,
			title,
			specialSeasonName,
		}, 'id');

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'red',
			message: 'Error updating the library: {0}',
			args: [error],
		});

		return res.json({
			status: 'error',
			message: 'Something went wrong updating the library: {0}',
			args: [error],
		});

	}
	try {
		const folderRoots = globalThis.mediaDb.query.folders.findMany({
			where: inArray(folders.path, F),
		});

		for (const folder of F) {
			insertLibraryFolder({
				library_id: id,
				folder_id: folderRoots.find(f => f.path == folder)!.id!,
			});
		}
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'red',
			message: 'Error updating the library folder: {0}',
			args: [error],
		});

		return res.json({
			status: 'error',
			message: 'Something went wrong updating the library folder: {0}',
			args: [error],
		});

	}
	try {

		for (const encoderProfile of E) {
			insertEncoderProfileLibrary({
				library_id: id,
				encoderProfile_id: encoderProfile,
			});
		}
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'red',
			message: 'Error updating the encoder profile library: {0}',
			args: [error],
		});

		return res.json({
			status: 'error',
			message: 'Something went wrong updating the encoder profile library: {0}',
			args: [error],
		});

	}
	try {
		if (S.length > 0) {

			const subtitleLanguages = globalThis.mediaDb.query.languages.findMany({
				where: inArray(languages.iso_639_1, S),
			});

			for (const subtitle of S) {
				insertSubtitleLanguage({
					library_id: id,
					type: 'subtitle',
					language_id: subtitleLanguages.find(l => l.iso_639_1 == subtitle)!.id,
				});
			}
		}

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'red',
			message: 'Error updating the library subtitles: {0}',
			args: [error],
		});

		return res.json({
			status: 'error',
			message: 'Something went wrong updating the library subtitles: {0}',
			args: [error],
		});

	}

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Updated library {0}',
		args: [id],
	});

	return res.json({
		status: 'ok',
		message: 'Successfully updated library {0}',
		args: [id],
	});

};

export const rescanLibrary = (req: Request, res: Response) => {
	const { id } = req.params;
	const {
		forceUpdate,
		synchronous,
	} = req.body;

	scanLibrary(id, forceUpdate, synchronous)
		.then((data) => {
			if (!data) {
				Logger.log({
					level: 'info',
					name: 'job',
					color: 'blueBright',
					message: 'Library does not exist',
				});
				return res.json({
					status: 'error',
					message: 'Library does not exist',
				});
			}

			Logger.log({
				level: 'info',
				name: 'job',
				color: 'blueBright',
				message: 'Updated library.',
			});
		});

	return res.json({
		status: 'ok',
		message: 'Successfully updated library.',
	});
};

export const deleteLibrary = (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const data = globalThis.mediaDb.delete(dbLibraries)
			.where(eq(dbLibraries.id, id))
			.returning()
			.get();

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Deleted {0} library.',
			args: [data?.title],
		});

		return res.json({
			status: 'error',
			message: 'Successfully deleted {0} library.',
			args: [data?.title],
		});
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'blueBright',
			message: 'Error deleting the library: {0}',
			args: [error],
		});
		return res.json({
			status: 'ok',
			message: 'Something went wrong deleting the library: {0}',
			args: [error],
		});

	}
};

export const addNewItem = async (req: Request, res: Response) => {

	const { id } = req.params;

	const library = globalThis.mediaDb.query.libraries.findFirst({
		where: eq(dbLibraries.id, id),
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
	});

	if (!library?.id) {
		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Library not found',
		});
		return res.json({
			status: 'error',
			message: 'Library not found',
		});
	}

	const {
		type,
		id: itemId,
	} = req.body;

	await i18n.changeLanguage('en');

	switch (type) {
	case 'movie':
		const movieData = await movie(itemId);

		await storeMovie({
			id: movieData.id,
			folder: createMediaFolder(library, movieData),
			libraryId: library.id,
		})
			.then((data) => {
				return res.json(data);
			});

		break;
	case 'tv':
		const tvData = await tv(itemId);

		await storeTvShow({
			id: tvData.id,
			folder: createMediaFolder(library, tvData),
			libraryId: library.id,
		})
			.then((data) => {
				return res.json(data);
			});

		break;
	case 'music':
		break;
	default:
		break;
	}

};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const encodeLibrary = async (req: Request, res: Response) => {

	// const id = parseInt(req.params.id, 10);

	// const data = await encodeInput({ id });

	// return res.json({
	// 	status: 'ok',
	// 	data,
	// });
};

export const deleteLibraryFolder = (req: Request, res: Response) => {
	const {
		id: library_id,
		folderId: folder_id,
	} = req.params;

	try {

		globalThis.mediaDb
			.delete(folders)
			.where(eq(folders.id, folder_id))
			.returning()
			.run();

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Deleted folder {0} from library {1}',
			args: [folder_id, library_id],
		});

		return res.json({
			status: 'ok',
			message: 'Successfully deleted folder {0} from library {1}',
			args: [folder_id, library_id],
		});

	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'blueBright',
			message: 'Error deleting the folder: {0}',
			args: [error],
		});
		return res.json({
			status: 'error',
			message: 'Something went wrong deleting the folder: {0}',
			args: [error],
		});
	}

};

export const addLibraryFolder = (req: Request, res: Response) => {
	const { id: library_id } = req.params;
	const { path: folder } = req.body;

	try {

		const data = insertFolder({ path: path.resolve(folder) });

		insertLibraryFolder({
			library_id: library_id,
			folder_id: data.id!,
		});

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Added folder {0} to library {1}',
			args: [data?.path, library_id],
		});

		return res.json({
			status: 'ok',
			message: 'Successfully added folder {0} to library {1}',
			args: [data?.path, library_id],
		});
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'blueBright',
			message: 'Error adding the folder: {0}',
			args: [error],
		});
		return res.json({
			status: 'error',
			message: 'Something went wrong adding the folder: {0}',
			args: [error],
		});
	}

};

export const sortLibrary = (req: Request, res: Response) => {
	try {
		req.body.libraries.forEach((library, index) => {
			globalThis.mediaDb
				.update(dbLibraries)
				.set({
					order: index,
				})
				.where(eq(dbLibraries.id, library.id))
				.run();
		});

		Logger.log({
			level: 'info',
			name: 'setup',
			color: 'blueBright',
			message: 'Sorted libraries',
		});

		return res.json({
			status: 'ok',
			message: 'Successfully sorted libraries',
		});
	} catch (error) {
		Logger.log({
			level: 'error',
			name: 'setup',
			color: 'blueBright',
			message: 'Error sorting the libraries: {0}',
			args: [error],
		});
		return res.json({
			status: 'error',
			message: 'Something went wrong sorting the libraries: {0}',
			args: [error],
		});
	}
};
