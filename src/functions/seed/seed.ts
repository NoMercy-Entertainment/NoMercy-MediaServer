import { confDb } from '../../database/config';
import { commitConfigTransaction } from '../../database';

import genres from '../../providers/tmdb/genres/index';
import { languages, countries } from '../../providers/tmdb/config/index';
import { activityLog, configData, devices, encoderProfiles, folders, libraries, notificationData, serverTasks } from './data';
import Logger from '../../functions/logger';
import { Prisma } from '@prisma/client'
import storeConfig from '../storeConfig';
import certifications from '../../providers/tmdb/certification/index';

const seed = async () => {
	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Seeding database',
	});

	const transaction: Prisma.PromiseReturnType<any>[] = [];

	storeConfig(configData, null, transaction);

	const Genres = await genres();
	for (const genre of Genres) {
		transaction.push(
			confDb.genre.upsert({
				where: {
					id: genre.id,
				},
				create: {
					id: genre.id,
					name: genre.name,
				},
				update: {
					id: genre.id,
					name: genre.name,
				},
			})
		);
	}

	const Certifications = await certifications();
	for (const certification of Certifications) {
		transaction.push(
			confDb.certification.upsert({
				where: {
					rating_iso31661: {
						iso31661: certification.iso_3166_1,
						rating: certification.certification,
					}
				},
				create: {
					iso31661: certification.iso_3166_1,
					rating: certification.certification,
					meaning: certification.meaning,
					order: certification.order,
				},
				update: {
					iso31661: certification.iso_3166_1,
					rating: certification.certification,
					meaning: certification.meaning,
					order: certification.order,
				},
			})
		);
	}

	const Languages = await languages();
	for (const language of Languages) {
		transaction.push(
			confDb.language.upsert({
				where: {
					iso_639_1: language.iso_639_1,
				},
				update: {
					iso_639_1: language.iso_639_1,
					name: language.name,
					english_name: language.english_name,
				},
				create: {
					iso_639_1: language.iso_639_1,
					name: language.name,
					english_name: language.english_name,
				},
			})
		);
	}

	const Countries = await countries();
	for (const country of Countries) {
		transaction.push(
			confDb.country.upsert({
				where: {
					iso31661: country.iso_3166_1,
				},
				update: {
					iso31661: country.iso_3166_1,
					native_name: country.native_name,
					english_name: country.english_name,
				},
				create: {
					iso31661: country.iso_3166_1,
					native_name: country.native_name,
					english_name: country.english_name,
				},
			})
		);
	}

	for (const [name, manage] of Object.entries(notificationData)) {
		transaction.push(
			confDb.notificationTypes.upsert({
				where: {
					name: name,
				},
				update: {
					name: name,
					manage: manage,
				},
				create: {
					name: name,
					manage: manage,
				},
			})
		);
	}

	for (const profile of encoderProfiles) {
		transaction.push(
			confDb.encoderProfile.upsert({
				where: {
					name: profile.name,
				},
				update: {
					name: profile.name,
					container: profile.container,
					param: JSON.stringify(profile.params, null, 2),
				},
				create: {
					name: profile.name,
					container: profile.container,
					param: JSON.stringify(profile.params, null, 2),
				},
			})
		);
	}

	for (const folder of folders) {
		transaction.push(
			confDb.folder.upsert({
				where: {
					id: folder.id,
				},
				create: {
					id: folder.id,
					path: folder.path,
				},
				update: {
					id: folder.id,
					path: folder.path,
				},
			})
		);
	}

	for (const library of libraries) {
		transaction.push(
			confDb.library.upsert({
				where: {
					id: library.id,
				},
				update: {
					id: library.id,
					title: library.title,
					autoRefreshInterval: library.autoRefreshInterval,
					chapterImages: library.chapterImages,
					extractChapters: library.extractChapters,
					extractChaptersDuring: library.extractChaptersDuring,
					image: library.image,
					perfectSubtitleMatch: library.perfectSubtitleMatch,
					realtime: library.realtime,
					specialSeasonName: library.specialSeasonName,
					type: library.type,
					folders: {
						set: library.folders.map((folder) => ({
							libraryId_folderId: {
								folderId: folder.id,
								libraryId: library.id,
							},
						})),
					},
					country: 'NL',
					language: 'nl',
				},
				create: {
					id: library.id,
					title: library.title,
					autoRefreshInterval: library.autoRefreshInterval,
					chapterImages: library.chapterImages,
					extractChapters: library.extractChapters,
					extractChaptersDuring: library.extractChaptersDuring,
					image: library.image,
					perfectSubtitleMatch: library.perfectSubtitleMatch,
					realtime: library.realtime,
					specialSeasonName: library.specialSeasonName,
					type: library.type,
					folders: {
						connectOrCreate: library.folders.map((folder) => ({
							where: {
								libraryId_folderId: {
									folderId: folder.id,
									libraryId: folder.path,
								},
							},
							create: {
								folderId: folder.id,
							},
						})),
					},
					country: 'NL',
					language: 'nl',
				},
			})
		);
	}

	for (const task of serverTasks) {
		transaction.push(
			confDb.runningTask.upsert({
				where: {
					id: task.id,
				},
				update: {
					id: task.id,
					title: task.title,
					type: task.type,
					value: task.value,
				},
				create: {
					id: task.id,
					title: task.title,
					type: task.type,
					value: task.value,
				},
			})
		);
	}

	for (const device of devices) {
		transaction.push(
			confDb.device.upsert({
				where: {
					id: device.id,
				},
				update: {
					id: device.id,
					deviceId: device.deviceId,
					title: device.title,
					type: device.type,
					version: device.version,
				},
				create: {
					id: device.id,
					deviceId: device.deviceId,
					title: device.title,
					type: device.type,
					version: device.version,
				},
			})
		);
	}

	const logs = await activityLog();

	for (const activity of logs) {
		transaction.push(
			confDb.activityLog.create({
				data: {
					from: activity.from,
					type: activity.type,
					time: new Date(activity.time),
					device: {
						connect: {
							id: activity.deviceId,
						},
					},
					user: {
						connect: {
							sub_id: activity.sub_id,
						},
					},
				},
			})
		);
	}

	await commitConfigTransaction(transaction);
};

export default seed;
