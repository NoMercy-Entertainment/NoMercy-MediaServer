import { confDb } from '../../database/config';
import { Request, Response } from 'express';
import Logger from '../../functions/logger';
import { updateEncoderProfilesParams } from 'types/server';
import { platform } from '../../functions/system';
import path from 'path';
import { scanLibrary } from '../../tasks/files/scanLibraries';

export const libraries = async (req: Request, res: Response) => {
	await confDb.library
		.findMany({
			include: {
				folders: {
					include: {
						folder: true,
					},
				},
				encoderProfiles: true,
				subtitleLanguages: {
					include: {
						language: true,
					},
				},
				metadata: true,
				// user: true,
			},
		})
		.then((data) => {
			const lib = data.map((d) => ({
				...d,
				extractChaptersDuring: d.extractChaptersDuring,
				language: d.language,
				country: d.country,
				folders: d.folders.map((f) => f.folder?.path),
				subtitleLanguages: undefined,
				encoderProfiles: d.encoderProfiles.map((e) => e.encoderProfileId),
				subtitles: d.subtitleLanguages.map((s) => s.language.iso_639_1),
			}));
			return res.json(lib);
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error getting encoder profiles: ${error}`,
			});
			return res.json({
				status: 'error',
				message: `Something went wrong getting encoder profiles: ${error}`,
			});
		});
};

export const createLibrary = async (req: Request, res: Response) => {};

export const updateLibrary = async (req: Request, res: Response) => {
	const {
		sub_id,
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
		metadata,
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
				in: folders.map((f) => (platform == 'windows' ? path.resolve(f).replace(/\/$/u, '') : f.replace(/\/$/u, ''))),
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
				folders: {
					// set: [],
					connectOrCreate: Folders.map((f) => ({
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
				encoderProfiles: {
					// set: [],
					connectOrCreate: EncoderProfiles.map((f) => ({
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
				subtitleLanguages: {
					// set: [],
					connectOrCreate: Languages.map((f) => ({
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
				status: 'error',
				message: `Successfully updated ${data.title} library.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error updating user permissions: ${error}`
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong updating permissions: ${error}`
			})
		});
};

export const rescanLibrary = async (req: Request, res: Response) => {

	const { id } = req.params;
	const { forceUpdate, synchronous } = req.body;

	await scanLibrary(id, forceUpdate, synchronous)
		.then((data) => {
			if(!data) {
				Logger.log({
					level: 'info',
					name: 'access',
					color: 'magentaBright',
					message: `Library does not exist`
				});
				return res.json({
					status: 'ok',
					message: `Library does not exist`
				})
			};

			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Updated ${data.title} library.`,
			});

			return res.json({
				status: 'error',
				message: `Successfully updated ${data.title} library.`,
			});
		})
		.catch((error) => {
			Logger.log({
				level: 'info',
				name: 'access',
				color: 'magentaBright',
				message: `Error updating the library: ${error}`
			});
			return res.json({
				status: 'ok',
				message: `Something went wrong updating the library: ${error}`
			})
		});
}

export const deleteLibrary = async (req: Request, res: Response) => {

	const { id } = req.params;

	confDb.library.delete({
		where: {
			id: id
		}
	}).then((data) => {
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
			message: `Error deleting the library: ${error}`
		});
		return res.json({
			status: 'ok',
			message: `Something went wrong deleting the library: ${error}`
		})
	});
}

