import { activityLog, configData, devices, encoderProfiles, folders, libraries, notificationData, serverTasks } from "./data";
import { countries, languages } from "../../providers/tmdb/config/index";

import Logger from "../../functions/logger";
import { Prisma } from "@prisma/client";
import certifications from "../../providers/tmdb/certification/index";
import { confDb } from "../../database/config";
import genres from "../../providers/tmdb/genres/index";
import { musicGenres } from "../../providers/musicbrainz/genre";
import storeConfig from "../storeConfig";

export const seed = async () => {
	Logger.log({
		level: "info",
		name: "setup",
		color: "blueBright",
		message: "Seeding database",
	});

	const transaction: Prisma.PromiseReturnType<any>[] = [];

	await storeConfig(configData, null, transaction);

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
					},
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
	
	const MusicGenres = await musicGenres();
	for (const genre of MusicGenres) {
		transaction.push(
			confDb.musicGenre.upsert({
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
					ip: device.ip,
					title: device.title,
					type: device.type,
					version: device.version,
				},
				create: {
					id: device.id,
					deviceId: device.deviceId,
					ip: device.ip,
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
					// from: activity.from,
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

	const users = await confDb.user.findMany();
	
	for (const library of libraries) {
		
		const libraryInsert = Prisma.validator<Prisma.LibraryUpdateInput>()({
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
			Folders: {
				connectOrCreate: library.folders.map((folder) => ({
					create: {
						folderId: folder.id,
					},
					where: {
						libraryId_folderId: {
							folderId: folder.id,
							libraryId: library.id,
						},
					}
				})),
			},
			User: {
				connectOrCreate: users.map((user) => ({
					create: {
						userId: user.sub_id,
					},
					where: {
						libraryId_userId: {
							userId: user.sub_id,
							libraryId: library.id,
						},
					}
				})),
			},
			country: "NL",
			language: "nl",
		});

		transaction.push(
			confDb.library.upsert({
				where: {
					id: library.id,
				},
				create: libraryInsert,
				update: libraryInsert,
			})
		);
	}

	await confDb.$transaction(transaction)
		.catch((error) => console.log(error));
		
};

export default seed;
