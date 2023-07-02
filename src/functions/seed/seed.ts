// cSpell: disable
import { configData, encoderProfiles, libraries, notificationData, special } from './data';
import { countries, languages } from '../../providers/tmdb/config/index';

import Logger from '../../functions/logger';
import certifications from '../../providers/tmdb/certification/index';
import colorPalette from '../colorPalette/colorPalette';
import { confDb } from '../../database/config';
import createBlurHash from '../createBlurHash/createBlurHash';
import { folders } from '../../../folderRoots';
import genres from '../../providers/tmdb/genres/index';
import { musicGenres } from '../../providers/musicbrainz/genre';
import storeConfig from '../storeConfig';

export const seed = async () => {

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Seeding database',
	});

	const transaction: any[] = [];

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

	if (!confDb.musicGenre.findFirst()) {
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
	}


	for (const profile of encoderProfiles) {
		transaction.push(
			confDb.encoderProfile.upsert({
				where: {
					name: profile.name,
				},
				update: {
					id: profile.id,
					name: profile.name,
					container: profile.container,
					param: JSON.stringify(profile.params, null, 2),
				},
				create: {
					id: profile.id,
					name: profile.name,
					container: profile.container,
					param: JSON.stringify(profile.params, null, 2),
				},
			})
		);
	}


	if (!process.env.SEED) {
		await confDb.$transaction(transaction)
			.catch(error => console.log(error));
		return;
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


	await confDb.$transaction(transaction)
		.catch(error => console.log(error));

	for (const library of libraries) {

		const libraryInsert = {
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
				connectOrCreate: library.folders.map(folder => ({
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
				connectOrCreate: {
					create: {
						encoderProfileId: encoderProfiles[encoderProfiles.length - 1].id,
					},
					where: {
						libraryId_encoderProfileId: {
							encoderProfileId: encoderProfiles[encoderProfiles.length - 1].id,
							libraryId: library.id,
						},
					},
				},
			},
			country: 'NL',
			language: 'nl',
		};

		// transaction.push(
		await confDb.library.upsert({
			where: {
				id: library.id,
			},
			create: libraryInsert,
			update: libraryInsert,
		});
		// );
	}


	const palette: any = {
		poster: undefined,
		backdrop: undefined,
	};

	const blurHash: any = {
		poster: undefined,
		backdrop: undefined,
	};

	await Promise.all([
		special.poster && createBlurHash(`https://image.tmdb.org/t/p/w185${special.poster}`).then((hash) => {
			blurHash.poster = hash;
		}),
		special.backdrop && createBlurHash(`https://image.tmdb.org/t/p/w185${special.backdrop}`).then((hash) => {
			blurHash.backdrop = hash;
		}),
		special.poster && colorPalette(`https://image.tmdb.org/t/p/w185${special.poster}`).then((hash) => {
			palette.poster = hash;
		}),
		special.backdrop && colorPalette(`https://image.tmdb.org/t/p/w185${special.backdrop}`).then((hash) => {
			palette.backdrop = hash;
		}),
	]);

	const movies = (await confDb.movie.findMany({
		where: {
			id: {
				in: special.Item.map(item => item.movieId!).filter(Boolean) ?? [],
			},
		},
		select: {
			id: true,
		},
	})).map(e => e.id);

	const episodes = (await confDb.episode.findMany({
		where: {
			id: {
				in: special.Item.map(item => item.episodeId!).filter(Boolean) ?? [],
			},
		},
		select: {
			id: true,
		},
	})).map(e => e.id);

	const filteredItems = special.Item.filter(i => (i.movieId && movies.includes(i.movieId)) || (i.episodeId && episodes.includes(i.episodeId)));
	const missingItems = special.Item.filter(i => !(i.movieId && movies.includes(i.movieId)) && !(i.episodeId && episodes.includes(i.episodeId)));
	console.log('missingItems', missingItems);

	await confDb.special.upsert({
		where: {
			title: special.title,
		},
		create: {
			...special,
			blurHash: JSON.stringify(blurHash),
			colorPalette: JSON.stringify(palette),
			Item: {
				connectOrCreate: filteredItems.map((item, index: number) => ({
					where: {
						movieId: item.movieId ?? undefined,
						episodeId: item.episodeId ?? undefined,
					},
					create: {
						...item,
						order: index,
					},
				})),
			},
		},
		update: {
			...special,
			blurHash: JSON.stringify(blurHash),
			colorPalette: JSON.stringify(palette),
			Item: {
				connectOrCreate: filteredItems.map((item, index: number) => ({
					where: {
						movieId: item.movieId ?? undefined,
						episodeId: item.episodeId ?? undefined,
					},
					create: {
						...item,
						order: index,
					},
				})),
			},
		},
	});
};

export default seed;
