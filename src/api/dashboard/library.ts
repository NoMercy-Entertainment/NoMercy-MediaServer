import { Request, Response } from 'express';

import Logger from '../../functions/logger';
import { confDb } from '../../database/config';
import {
	createMediaFolder
} from '../../tasks/files/filenameParser';
import { encodeInput } from '../../functions/ffmpeg/encodeInput';
import i18n from '../../loaders/i18n';
import { movie } from '../../providers/tmdb/movie';
import path from 'path';
import { platform } from '../../functions/system';
import {
	scanLibrary
} from '../../tasks/files/scanLibraries';
import storeMovie from '../../tasks/data/storeMovie';
import storeTvShow from '../../tasks/data/storeTvShow';
import { tv } from '../../providers/tmdb/tv';
import { updateEncoderProfilesParams } from 'types/server';
import { selectLibrariesWithRelations } from '@/db/media/actions/libraries';

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

export const createLibrary = async (req: Request, res: Response) => {
	//
	const {
		type,
		folders,
		chapterImages,
		specialSeasonName,
		title,
		subtitles,
		encoderProfiles: profiles,
	} = req.body;

	const users = await confDb.user.findMany();

	const lib = await confDb.library.findFirst({
		where: {
			title: title,
		},
	});

	const library = lib
		? lib
		: await confDb.library.create({
			data: {
				title: title,
				autoRefreshInterval: '30',
				chapterImages: chapterImages,
				extractChapters: chapterImages,
				extractChaptersDuring: true,
				perfectSubtitleMatch: true,
				realtime: true,
				specialSeasonName: specialSeasonName,
				type: type,
				country: 'NL',
				language: 'nl',
			},
		});

	folders.map(async (folder: string) => {
		await confDb.folder.upsert({
			where: {
				path: folder,
			},
			create: {
				path: folder,
			},
			update: {
				path: folder,
			},
		});
	});

	const Folders = await confDb.folder.findMany();
	const Languages = await confDb.language.findMany();

	await confDb.library.update({
		where: {
			id: library.id,
		},
		data: {
			Folders: {
				connectOrCreate: Folders.map(folder => ({
					create: {
						folderId: folder.id,
					},
					where: {
						libraryId_folderId: {
							folderId: folder.id,
							libraryId: library.id,
						},
					},
				})),
			},
			User: {
				connectOrCreate: users.map(user => ({
					create: {
						userId: user.sub_id,
					},
					where: {
						libraryId_userId: {
							userId: user.sub_id,
							libraryId: library.id,
						},
					},
				})),
			},
			EncoderProfiles: {
				connectOrCreate: profiles.map((encoderProfile) => {
					return {
						create: {
							encoderProfileId: encoderProfile,
						},
						where: {
							libraryId_encoderProfileId: {
								encoderProfileId: encoderProfile,
								libraryId: library.id,
							},
						},
					};
				}),
			},
			SubtitleLanguages: {
				connectOrCreate: subtitles.map((subtitle) => {
					const language = Languages.find(l => l.iso_639_1 == subtitle)!;
					return {
						create: {
							languageId: language.id,
						},
						where: {
							libraryId_languageId: {
								languageId: language.id,
								libraryId: library.id,
							},
						},
					};
				}),
			},
		},
	});

	return res.json({
		status: 'ok',
		message: `Successfully created ${title} library.`,
	});
};

export const updateLibrary = async (req: Request, res: Response) => {
	const {
		autoRefreshInterval,
		chapterImages,
		country,
		encoderProfiles,
		extractChapters,
		extractChaptersDuring,
		folders,
		id,
		image,
		language,
		perfectSubtitleMatch,
		realtime,
		specialSeasonName,
		subtitles,
		title,
		type,
	}: updateEncoderProfilesParams = req.body;

	const Folders = await confDb.folder.findMany({
		where: {
			path: {
				in: folders.map(f => (platform == 'windows'
					? path.resolve(f)?.replace(/\/$/u, '')
					: f?.replace(/\/$/u, ''))),
			},
		},
	});

	const EncoderProfiles = await confDb.encoderProfile.findMany({
		where: {
			id: {
				in: encoderProfiles,
			},
		},
	});

	const Languages = await confDb.language.findMany({
		where: {
			iso_639_1: {
				in: subtitles,
			},
		},
	});

	confDb.library
		.update({
			where: {
				id: id,
			},
			data: {
				id: id,
				autoRefreshInterval: autoRefreshInterval,
				chapterImages: chapterImages,
				extractChapters: extractChapters,
				extractChaptersDuring: extractChaptersDuring,
				image: image,
				perfectSubtitleMatch: perfectSubtitleMatch,
				realtime: realtime,
				specialSeasonName: specialSeasonName,
				title: title,
				type: type,
				Folders: {
					// set: [],
					connectOrCreate: Folders.map(f => ({
						where: {
							libraryId_folderId: {
								folderId: f.id,
								libraryId: id,
							},
						},
						create: {
							folderId: f.id,
						},
					})),
				},
				EncoderProfiles: {
					// set: [],
					connectOrCreate: EncoderProfiles.map(f => ({
						where: {
							libraryId_encoderProfileId: {
								encoderProfileId: f.id,
								libraryId: id,
							},
						},
						create: {
							encoderProfileId: f.id,
						},
					})),
				},
				SubtitleLanguages: {
					// set: [],
					connectOrCreate: Languages.map(f => ({
						where: {
							libraryId_languageId: {
								languageId: f.id,
								libraryId: id,
							},
						},
						create: {
							languageId: f.id,
						},
					})),
				},
				country: country,
				language: language.toLowerCase(),

				// metadata: metadata,
			},
			select: {
				title: true,
			},
		})
		.then((data) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Updated ${data.title} library.`,
			});

			return res.json({
				status: 'ok',
				message: `Successfully updated ${data.title} library.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error updating user permissions: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong updating permissions: ${error}`,
			});
		});
};

export const rescanLibrary = (req: Request, res: Response) => {
	const { id } = req.params;
	const { forceUpdate, synchronous } = req.body;

	scanLibrary(id, forceUpdate, synchronous)
		.then((data) => {
			if (!data) {
				Logger.log({
					level: 'info',
					name: 'job',
					color: 'magentaBright',
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
				color: 'magentaBright',
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

	confDb.library
		.delete({
			where: {
				id: id,
			},
		})
		.then((data) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Deleted ${data.title} library.`,
			});

			return res.json({
				status: 'error',
				message: `Successfully deleted ${data.title} library.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error deleting the library: ${error}`,
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong deleting the library: ${error}`,
			});
		});
};

export const addNewItem = async (req: Request, res: Response) => {

	const { id } = req.params;

	const library = await confDb.library
		.findFirst({
			where: {
				id: id,
			},
			include: {
				Folders: {
					include: {
						folder: true,
					},
				},
			},
		}).catch(e => console.log(e));

	if (!library?.id) {
		Logger.log({
			level: 'info',
			name: 'access',
			color: 'magentaBright',
			message: 'Library not found',
		});
		return res.json({
			status: 'error',
			message: 'Library not found',
		});
	}

	const { type, id: itemId } = req.body;

	await i18n.changeLanguage('en');

	switch (type) {
	case 'movie':
		const movieData = await movie(itemId);

		await storeMovie({
			id: movieData.id,
			folder: createMediaFolder(library, movieData),
			libraryId: library.id,
		}).then((data) => {
			return res.json(data);
		});

		break;
	case 'tv':
		const tvData = await tv(itemId);

		await storeTvShow({
			id: tvData.id,
			folder: createMediaFolder(library, tvData),
			libraryId: library.id,
		}).then((data) => {
			return res.json(data);
		});

		break;
	case 'music':
		break;
	default:
		break;
	}

};

export const encodeLibrary = async (req: Request, res: Response) => {

	const id = parseInt(req.params.id, 10);

	const data = await encodeInput({ id });

	return res.json({
		status: 'ok',
		data,
	});
};
