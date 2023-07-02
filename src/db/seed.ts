// cSpell: disable
import Logger from '@/functions/logger';
import { configData, encoderProfiles, libraries, notificationData, special } from './seedData';
import storeConfig from '@/functions/storeConfig/storeConfig';
import genres from '@/providers/tmdb/genres';
import certifications from '@/providers/tmdb/certification';
import { countries, languages } from '@/providers/tmdb/config';
import { musicGenres } from '@/providers/musicbrainz/genre';
import { getUsers } from '@/functions/users';
import colorPalette from '@/functions/colorPalette';
import createBlurHash from '@/functions/createBlurHash';
import { mappedEntries } from '@/functions/stringArray';
import { folders } from '../../folderRoots';
import { insertCertification } from './media/actions/certifications';
import { insertEncoderProfile } from './media/actions/encoderProfiles';
import { getEpisodesDB } from './media/actions/episodes';
import { insertFolder } from './media/actions/folders';
import { insertGenre } from './media/actions/genres';
import { insertLanguage } from './media/actions/languages';
import { insertLibrary } from './media/actions/libraries';
import { insertLibraryFolder } from './media/actions/folder_library';
import { insertLibraryUser } from './media/actions/library_user';
import { getMoviesDB } from './media/actions/movies';
import { selectMusicGenre, insertMusicGenre } from './media/actions/musicGenres';
import { insertNotification } from './media/actions/notifications';
import { insertProviderPriority } from './media/actions/priority_provider';
import { selectProvider, insertProvider } from './media/actions/providers';
import { insertSpecialItem } from './media/actions/specialItems';
import { insertSpecial } from './media/actions/specials';
import { selectUser } from './media/actions/users';
import { providers } from '@/providers/tmdb/watch_providers';
import { insertCountry } from './media/actions/countries';
import { insertEncoderProfileLibrary } from './media/actions/encoderProfile_library';

export const seed = async () => {

	Logger.log({
		level: 'info',
		name: 'setup',
		color: 'blueBright',
		message: 'Seeding database',
	});

	await storeConfig(configData, null);

	const Genres = await genres();
	for (const genre of Genres) {
		insertGenre({
			id: genre.id,
			name: genre.name,
		});
	}

	if (selectProvider().length == 0) {
		const Providers = await providers();
		for (const provider of Providers) {
			insertProvider({
				id: provider.provider_id,
				logo_path: provider.logo_path,
				provider_name: provider.provider_name,
				display_priority: provider.display_priority,
			});

			for (const [country, priority] of mappedEntries(provider.display_priorities)) {
				insertProviderPriority({
					priority: priority,
					country: country,
					provider_id: provider.provider_id,
				});
			}
		}
	}

	const Certifications = await certifications();
	for (const certification of Certifications) {
		insertCertification({
			iso31661: certification.iso_3166_1,
			rating: certification.certification,
			meaning: certification.meaning,
			order: certification.order,
		});
	}

	const Languages = await languages();
	for (const language of Languages) {
		insertLanguage({
			iso_639_1: language.iso_639_1,
			name: language.name,
			english_name: language.english_name,
		});
	}

	const Countries = await countries();
	for (const country of Countries) {
		insertCountry({
			iso31661: country.iso_3166_1,
			native_name: country.native_name,
			english_name: country.english_name,
		});
	}

	if (selectMusicGenre().length == 0) {
		const Genres = await musicGenres();
		for (const genre of Genres) {
			insertMusicGenre({
				id: genre.id,
				name: genre.name,
			});
		}
	}

	for (const profile of encoderProfiles) {
		insertEncoderProfile({
			id: profile.id,
			name: profile.name,
			container: profile.container,
			param: JSON.stringify(profile.params, null, 2),
		});
	}

	if (!process.env.SEED || process.env.SEED == 'false') {
		return;
	}

	for (const [name, manage] of Object.entries(notificationData)) {
		insertNotification({
			name: name,
			manage: manage,
		});
	}

	for (const folder of folders) {
		insertFolder({
			id: folder.id,
			path: folder.path,
		});
	}

	await getUsers();

	const users = selectUser();

	for (const library of libraries) {

		insertLibrary({
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
			country: 'NL',
			language: 'nl',
		}, 'id');

		for (const folder of library.folders) {
			insertLibraryFolder({
				folder_id: folder.id,
				library_id: library.id,
			});
		};

		for (const user of users) {
			insertLibraryUser({
				user_id: user.id,
				library_id: library.id,
			});
		};

		for (const profile of encoderProfiles.filter(e => e.name.includes('regular'))) {
			insertEncoderProfileLibrary({
				encoderProfile_id: profile.id,
				library_id: library.id,
			});
		}
	};

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

	const movies = getMoviesDB().map(e => e.id);
	const episodes = getEpisodesDB().map(e => e.id);

	const filteredItems = special.Item.filter(i => (i.movieId && movies.includes(i.movieId)) || (i.episodeId && episodes.includes(i.episodeId)));
	// const missingItems = special.Item.filter(i => !(i.movie_id && movies.includes(i.movie_id)) && !(i.episode_id && episodes.includes(i.episode_id)));
	// console.log('missingItems', missingItems);

	insertSpecial({
		id: special.id,
		title: special.title,
		description: special.description,
		poster: special.poster,
		backdrop: special.backdrop,
		logo: special.logo,
		blurHash: JSON.stringify(blurHash),
		colorPalette: JSON.stringify(palette),
	});

	for (const [index, item] of filteredItems.entries()) {
		insertSpecialItem({
			order: index,
			episode_id: item.episodeId,
			movie_id: item.movieId,
			special_id: special.id,
		}, item.movieId
			? 'movie'
			: 'episode');
	}
};

export default seed;
