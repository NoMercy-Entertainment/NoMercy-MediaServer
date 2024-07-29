import { sqliteTable, numeric, text, integer, primaryKey, index, uniqueIndex, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { boolean } from '@server/db/helpers';


export const drizzleMigrations = sqliteTable('__drizzle_migrations', {
	id: numeric('id')
		.primaryKey(),
	hash: text('hash')
		.notNull(),
	createdAt: numeric('created_at'),
});

export const activityLogs = sqliteTable('activityLogs', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	type: text('type')
		.notNull(),
	time: numeric('time')
		.notNull(),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	deviceId: text('device_id')
		.notNull()
		.references(() => devices.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
});

export const albumArtist = sqliteTable('album_artist', {
	albumId: text('album_id')
		.notNull()
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	artistId: text('artist_id')
		.notNull()
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.albumId, table.artistId),
	};
});

export const albumLibrary = sqliteTable('album_library', {
	albumId: text('album_id')
		.notNull()
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.albumId, table.libraryId),
	};
});

export const albumTrack = sqliteTable('album_track', {
	albumId: text('album_id')
		.notNull()
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.albumId, table.trackId),
	};
});

export const albums = sqliteTable('albums', {
	id: text('id')
		.primaryKey()
		.notNull(),
	name: text('name')
		.notNull(),
	description: text('description'),
	folder: text('folder'),
	cover: text('cover'),
	country: text('country'),
	year: integer('year'),
	tracks: integer('tracks'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		albumIdIdx: index('album_id_index')
			.on(table.id),
	};
});

export const alternativeTitles = sqliteTable('alternativeTitles', {
	id: text('id')
		.primaryKey(),
	iso31661: text('iso31661')
		.notNull(),
	title: text('title')
		.notNull(),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		alternativeTitlesTvIdx: index('alternative_titles_tv_index')
			.on(table.tvId),
		alternativeTitlesTvUnique: uniqueIndex('alternative_titles_tv_unique')
			.on(table.tvId, table.iso31661),
		alternativeTitlesMovieIdx: index('alternative_titles_movie_index')
			.on(table.movieId),
		alternativeTitlesMovieUnique: uniqueIndex('alternative_titles_movie_unique')
			.on(table.movieId, table.iso31661),
	};
});

export const artistLibrary = sqliteTable('artist_library', {
	artistId: text('artist_id')
		.notNull()
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.artistId, table.libraryId),
	};
});

export const artistTrack = sqliteTable('artist_track', {
	artistId: text('artist_id')
		.notNull()
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.artistId, table.trackId),
	};
});

export const artists = sqliteTable('artists', {
	id: text('id')
		.primaryKey()
		.notNull(),
	name: text('name')
		.notNull(),
	description: text('description'),
	folder: text('folder'),
	cover: text('cover'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		artistIdIdx: index('artist_id_index')
			.on(table.id),
	};
});

export const casts = sqliteTable('casts', {
	id: text('id')
		.primaryKey()
		.notNull(),
	personId: integer('person_id')
		.notNull()
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.references(() => tvs.id),
	seasonId: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		castPersonsUnique: uniqueIndex('cast_persons_unique')
			.on(table.id, table.personId),
		castEpisodesUnique: uniqueIndex('cast_episodes_unique')
			.on(table.id, table.episodeId),
		castSeasonsUnique: uniqueIndex('cast_seasons_unique')
			.on(table.id, table.seasonId),
		castTvUnique: uniqueIndex('cast_tv_unique')
			.on(table.id, table.tvId),
		castMovieUnique: uniqueIndex('cast_movie_unique')
			.on(table.id, table.movieId),
		index: index('casts_index')
			.on(table.personId, table.movieId, table.tvId, table.seasonId, table.episodeId),
	};
});

export const certificationMovie = sqliteTable('certification_movie', {
	iso31661: text('iso31661'),
	certificationId: integer('certification_id')
		.notNull()
		.references(() => certifications.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.certificationId, table.iso31661, table.movieId),
	};
});

export const certificationTv = sqliteTable('certification_tv', {
	iso31661: text('iso31661'),
	certificationId: integer('certification_id')
		.notNull()
		.references(() => certifications.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.certificationId, table.iso31661, table.tvId),
	};
});

export const certifications = sqliteTable('certifications', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	iso31661: text('iso31661')
		.notNull(),
	meaning: text('meaning')
		.notNull(),
	order: integer('order')
		.notNull(),
	rating: text('rating')
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('certifications_unique')
			.on(table.iso31661, table.rating),
		index: index('certifications_index')
			.on(table.id),
	};
});

export const collectionLibrary = sqliteTable('collection_library', {
	collectionId: integer('collection_id')
		.notNull()
		.references(() => collections.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	libraryId: integer('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.collectionId, table.libraryId),
	};
});

export const collectionMovie = sqliteTable('collection_movie', {
	collectionId: integer('collection_id')
		.notNull()
		.references(() => collections.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.collectionId, table.movieId),
	};
});

export const collections = sqliteTable('collections', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	backdrop: text('backdrop'),
	overview: text('overview'),
	parts: integer('parts'),
	poster: text('poster'),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('collections_unique')
			.on(table.backdrop, table.poster),
		index: index('collections_index')
			.on(table.id),
	};
});

export const configuration = sqliteTable('configuration', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	key: text('key')
		.notNull(),
	value: text('value'),
	modifiedBy: text('modified_by'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('configuration_unique')
			.on(table.key),
		index: index('configuration_index')
			.on(table.key),
	};
});

export const countries = sqliteTable('countries', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	iso31661: text('iso31661')
		.notNull(),
	englishName: text('english_name'),
	nativeName: text('native_name'),
}, (table) => {
	return {
		unique: uniqueIndex('countries_unique')
			.on(table.iso31661),
		index: index('countries_index')
			.on(table.id),
	};
});

export const creators = sqliteTable('creators', {
	personId: integer('person_id')
		.notNull()
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('creators_unique')
			.on(table.personId, table.tvId),
	};
});

export const crews = sqliteTable('crews', {
	id: text('id')
		.primaryKey()
		.notNull(),
	personId: integer('person_id')
		.notNull()
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.references(() => tvs.id),
	seasonId: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		episodesUnique: uniqueIndex('crews_episodes_unique')
			.on(table.id, table.personId, table.episodeId),
		seasonsUnique: uniqueIndex('crews_seasons_unique')
			.on(table.id, table.personId, table.seasonId),
		tvUnique: uniqueIndex('crews_tv_unique')
			.on(table.id, table.personId, table.tvId),
		movieUnique: uniqueIndex('crews_movie_unique')
			.on(table.id, table.personId, table.movieId),
	};
});

export const devices = sqliteTable('devices', {
	id: text('id')
		.primaryKey(),
	deviceId: text('device_id')
		.notNull(),
	browser: text('browser')
		.notNull(),
	os: text('os')
		.notNull(),
	device: text('device')
		.notNull(),
	type: text('type')
		.notNull(),
	name: text('name')
		.notNull(),
	customName: text('custom_name'),
	version: text('version')
		.notNull(),
	ip: text('ip')
		.notNull(),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('devices_unique')
			.on(table.deviceId, table.type, table.name, table.version),
		index: index('devices_index')
			.on(table.deviceId),
	};
});

export const encoderProfileLibrary = sqliteTable('encoderProfile_library', {
	encoderProfileId: text('encoderProfile_id')
		.notNull()
		.references(() => encoderProfiles.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.encoderProfileId, table.libraryId),
	};
});

export const encoderProfiles = sqliteTable('encoderProfiles', {
	id: text('id')
		.primaryKey(),
	name: text('name')
		.notNull(),
	container: text('container'),
	param: text('param'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('encoderProfiles_unique')
			.on(table.name),
		index: index('encoderProfiles_index')
			.on(table.id),
	};
});

export const episodes = sqliteTable('episodes', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	title: text('title'),
	airDate: text('airDate'),
	episodeNumber: integer('episodeNumber')
		.notNull(),
	imdbId: text('imdbId'),
	overview: text('overview'),
	productionCode: text('productionCode'),
	seasonNumber: integer('seasonNumber')
		.notNull(),
	still: text('still'),
	tvdbId: integer('tvdbId'),
	voteAverage: integer('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	seasonId: integer('season_id')
		.notNull()
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		episodeSeasonIdx: index('episode_season_index')
			.on(table.seasonId),
		episodeIdx: index('episode_index')
			.on(table.id),
	};
});

export const fileLibrary = sqliteTable('file_library', {
	fileId: text('file_id')
		.notNull()
		.references(() => files.id),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id),
}, (table) => {
	return {
		pk0: primaryKey(table.fileId, table.libraryId),
	};
});

export const fileMovie = sqliteTable('file_movie', {
	fileId: text('file_id')
		.notNull()
		.references(() => files.id),
	movieId: text('movie_id')
		.notNull()
		.references(() => movies.id),
}, (table) => {
	return {
		pk0: primaryKey(table.fileId, table.movieId),
	};
});

export const files = sqliteTable('files', {
	id: text('id')
		.primaryKey(),
	folder: text('folder')
		.notNull(),
	episodeNumber: integer('episodeNumber'),
	seasonNumber: integer('seasonNumber'),
	episodeFolder: text('episodeFolder'),
	name: text('name')
		.notNull(),
	extension: text('extension')
		.notNull(),
	year: integer('year'),
	size: real('size')
		.notNull(),
	atimeMs: real('atimeMs')
		.notNull(),
	birthtimeMs: real('birthtimeMs')
		.notNull(),
	ctimeMs: real('ctimeMs')
		.notNull(),
	edition: text('edition'),
	resolution: text('resolution'),
	videoCodec: text('videoCodec'),
	audioCodec: text('audioCodec'),
	audioChannels: text('audioChannels'),
	ffprobe: text('ffprobe'),
	chapters: text('chapters'),
	fullSeason: numeric('fullSeason'),
	gid: integer('gid'),
	group: text('group'),
	airDate: numeric('airDate'),
	multi: numeric('multi'),
	complete: numeric('complete'),
	isMultiSeason: numeric('isMultiSeason'),
	isPartialSeason: numeric('isPartialSeason'),
	isSeasonExtra: numeric('isSeasonExtra'),
	isSpecial: numeric('isSpecial'),
	isTv: numeric('isTv'),
	languages: text('languages'),
	mode: real('mode'),
	mtimeMs: real('mtimeMs'),
	nlink: real('nlink'),
	path: text('path')
		.notNull(),
	revision: text('revision'),
	seasonPart: real('seasonPart'),
	sources: text('sources'),
	title: text('title')
		.notNull(),
	type: text('type')
		.notNull(),
	uid: real('uid'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	libraryId: text('library_id')
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	albumId: integer('album_id')
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('files_unique')
			.on(table.path),
		index: index('files_index')
			.on(table.path, table.libraryId),
	};
});

export const folderLibrary = sqliteTable('folder_library', {
	folderId: text('folder_id')
		.notNull()
		.references(() => folders.id),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id),
}, (table) => {
	return {
		pk0: primaryKey(table.folderId, table.libraryId),
	};
});

export const folders = sqliteTable('folders', {
	id: text('id')
		.primaryKey(),
	path: text('path'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('folders_unique')
			.on(table.path),
		index: index('folders_index')
			.on(table.id),
	};
});

export const genreMovie = sqliteTable('genre_movie', {
	genreId: integer('genre_id')
		.notNull()
		.references(() => genres.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.genreId, table.movieId),
	};
});

export const genreTv = sqliteTable('genre_tv', {
	genreId: integer('genre_id')
		.notNull()
		.references(() => genres.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.genreId, table.tvId),
	};
});

export const genres = sqliteTable('genres', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	name: text('name'),
}, (table) => {
	return {
		unique: uniqueIndex('genres_unique')
			.on(table.id),
		index: index('genres_index')
			.on(table.id),
	};
});

export const guestStars = sqliteTable('guestStars', {
	id: text('id')
		.primaryKey()
		.notNull(),
	personId: integer('person_id')
		.notNull()
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.notNull()
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		index: index('guestStars_index')
			.on(table.episodeId),
	};
});

export const images = sqliteTable('images', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	aspectRatio: real('aspectRatio'),
	height: integer('height'),
	iso6391: text('iso6391'),
	name: text('name'),
	site: text('site'),
	size: integer('size'),
	filePath: text('filePath')
		.notNull(),
	type: text('type'),
	width: integer('width'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	castId: text('cast_id')
		.references(() => casts.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	crewId: text('crew_id')
		.references(() => crews.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	personId: integer('person_id')
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	artistId: text('artist_id')
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	albumId: text('album_id')
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	seasonId: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	collectionId: integer('collection_id')
		.references(() => collections.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		trackUnique: uniqueIndex('images_track_unique')
			.on(table.trackId, table.filePath),
		albumUnique: uniqueIndex('images_album_unique')
			.on(table.albumId, table.filePath),
		artistUnique: uniqueIndex('images_artist_unique')
			.on(table.artistId, table.filePath),
		crewUnique: uniqueIndex('images_crew_unique')
			.on(table.crewId, table.filePath),
		castUnique: uniqueIndex('images_cast_unique')
			.on(table.castId, table.filePath),
		personUnique: uniqueIndex('images_person_unique')
			.on(table.personId, table.filePath),
		collectionUnique: uniqueIndex('images_collection_unique')
			.on(table.collectionId, table.filePath),
		movieUnique: uniqueIndex('images_movie_unique')
			.on(table.movieId, table.filePath),
		episodeUnique: uniqueIndex('images_episode_unique')
			.on(table.episodeId, table.filePath),
		seasonUnique: uniqueIndex('images_season_unique')
			.on(table.seasonId, table.filePath),
		tvUnique: uniqueIndex('images_tv_unique')
			.on(table.tvId, table.filePath),
		inique: uniqueIndex('images_inique')
			.on(table.filePath),
		index: index('images_index')
			.on(table.episodeId, table.movieId, table.personId, table.seasonId, table.tvId, table.albumId, table.artistId, table.castId, table.crewId, table.collectionId, table.trackId),
	};
});

export const jobs = sqliteTable('jobs', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	creditId: text('credit_id')
		.notNull(),
	job: text('job')
		.notNull(),
	episodeCount: integer('episodeCount'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	crewId: text('crew_id')
		.references(() => crews.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('jobs_unique')
			.on(table.creditId),
		index: index('jobs_index')
			.on(table.id),
	};
});

export const keywordMovie = sqliteTable('keyword_movie', {
	keywordId: integer('keyword_id')
		.notNull()
		.references(() => keywords.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.keywordId, table.movieId),
	};
});

export const keywordTv = sqliteTable('keyword_tv', {
	keywordId: integer('keyword_id')
		.notNull()
		.references(() => keywords.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.keywordId, table.tvId),
	};
});

export const keywords = sqliteTable('keywords', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	name: text('name')
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('keywords_unique')
			.on(table.id),
		index: index('keywords_index')
			.on(table.id),
	};
});

export const languageLibrary = sqliteTable('language_library', {
	languageId: integer('language_id')
		.notNull()
		.references(() => languages.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	type: text('type')
		.notNull(),
}, (table) => {
	return {
		pk0: primaryKey(table.languageId, table.libraryId, table.type),
	};
});

export const languages = sqliteTable('languages', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	iso6391: text('iso_639_1')
		.notNull(),
	englishName: text('english_name')
		.notNull(),
	name: text('name'),
}, (table) => {
	return {
		languageUnique: uniqueIndex('language_unique')
			.on(table.iso6391),
		languageIdx: index('language_index')
			.on(table.iso6391),
	};
});

export const libraries = sqliteTable('libraries', {
	id: text('id')
		.primaryKey(),
	autoRefreshInterval: integer('autoRefreshInterval')
		.notNull(),
	chapterImages: numeric('chapterImages')
		.notNull(),
	extractChapters: numeric('extractChapters')
		.notNull(),
	extractChaptersDuring: numeric('extractChaptersDuring')
		.notNull(),
	image: text('image'),
	perfectSubtitleMatch: numeric('perfectSubtitleMatch')
		.notNull(),
	realtime: numeric('realtime')
		.notNull(),
	specialSeasonName: text('specialSeasonName')
		.notNull(),
	title: text('title')
		.notNull(),
	type: text('type')
		.notNull(),
	country: text('country')
		.notNull(),
	language: text('language')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		libraryIdx: uniqueIndex('library_index')
			.on(table.id, table.title),
	};
});

export const libraryMovie = sqliteTable('library_movie', {
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.libraryId, table.movieId),
	};
});

export const libraryTrack = sqliteTable('library_track', {
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.libraryId, table.trackId),
	};
});

export const libraryTv = sqliteTable('library_tv', {
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.libraryId, table.tvId),
	};
});

export const libraryUser = sqliteTable('library_user', {
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.libraryId, table.userId),
	};
});

export const mediaAttachments = sqliteTable('mediaAttachments', {
	id: text('id')
		.primaryKey(),
	type: integer('type')
		.notNull(),
	value: text('value')
		.notNull(),
	cleanValue: text('cleanValue')
		.notNull(),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	fileId: text('file_id')
		.notNull()
		.references(() => files.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		mediaAttachmentsUnique: uniqueIndex('media_attachments_unique')
			.on(table.type),
		mediaAttachmentsIndex2: index('media_attachments_index2')
			.on(table.id, table.type, table.value),
		mediaAttachmentsIdx: index('media_attachments_index')
			.on(table.id, table.type, table.cleanValue),
	};
});

export const medias = sqliteTable('medias', {
	id: text('id')
		.primaryKey(),
	aspectRatio: real('aspectRatio'),
	height: integer('height'),
	iso6391: text('iso6391'),
	name: text('name'),
	site: text('site'),
	size: integer('size'),
	src: text('src')
		.notNull(),
	type: text('type'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	width: integer('width'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	tvId: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	seasonId: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	personId: integer('person_id')
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	videoFileId: integer('videoFile_id')
		.references(() => videoFiles.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('medias_unique')
			.on(table.src),
		index: index('medias_index')
			.on(table.id),
	};
});

export const mediaStreams = sqliteTable('mediaStreams', {
	id: text('id')
		.primaryKey(),
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
	dvBlSignalCompatibilityId: integer('dvBlSignalCompatibility_id'),
	keyFrames: text('keyFrames'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	fileId: text('file_id')
		.notNull()
		.references(() => files.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		mediastreamsUnique: index('mediastreams_unique')
			.on(table.fileId, table.streamIndex),
		mediastreamsIdx: index('mediastreams_index')
			.on(table.id, table.streamIndex),
	};
});

export const messages = sqliteTable('messages', {
	id: text('id')
		.primaryKey(),
	body: text('body'),
	from: text('from'),
	image: text('image'),
	notify: numeric('notify'),
	read: numeric('read'),
	title: text('title'),
	to: text('to'),
	type: text('type'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

export const metadata = sqliteTable('metadata', {
	id: text('id')
		.primaryKey(),
	title: text('title')
		.notNull(),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('metadata_unique')
			.on(table.title),
		index: index('metadata_index')
			.on(table.id),
	};
});

export const movies = sqliteTable('movies', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	duration: text('duration'),
	show: numeric('show'),
	folder: text('folder'),
	adult: numeric('adult'),
	backdrop: text('backdrop'),
	budget: integer('budget'),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	originalTitle: text('originalTitle'),
	originalLanguage: text('originalLanguage'),
	overview: text('overview'),
	popularity: real('popularity'),
	poster: text('poster'),
	releaseDate: numeric('releaseDate')
		.notNull(),
	revenue: integer('revenue'),
	runtime: integer('runtime'),
	status: text('status'),
	tagline: text('tagline'),
	trailer: text('trailer'),
	tvdbId: integer('tvdbId'),
	video: text('video'),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		movieUnique: uniqueIndex('movie_unique')
			.on(table.id),
		movieIdx: index('movie_index')
			.on(table.id),
	};
});

export const musicGenreTrack = sqliteTable('musicGenre_track', {
	musicGenreId: text('musicGenre_id')
		.notNull()
		.references(() => musicGenres.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.musicGenreId, table.trackId),
	};
});

export const musicGenres = sqliteTable('musicGenres', {
	id: text('id')
		.primaryKey(),
	name: text('name')
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('musicGenres_unique')
			.on(table.name),
		index: index('musicGenres_index')
			.on(table.id),
	};
});

export const notificationUser = sqliteTable('notification_user', {
	notificationId: text('notification_id')
		.notNull()
		.references(() => notifications.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.notificationId, table.userId),
	};
});

export const notifications = sqliteTable('notifications', {
	id: text('id')
		.primaryKey(),
	name: text('name')
		.notNull(),
	manage: numeric('manage')
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('notifications_unique')
			.on(table.name),
		index: index('notifications_index')
			.on(table.id),
	};
});

export const people = sqliteTable('people', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	adult: numeric('adult'),
	alsoKnownAs: text('alsoKnownAs'),
	biography: text('biography'),
	birthday: text('birthday'),
	deathDay: text('deathDay'),
	gender: integer('gender')
		.default(0),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	knownForDepartment: text('knownForDepartment'),
	name: text('name'),
	placeOfBirth: text('placeOfBirth'),
	popularity: real('popularity'),
	profile: text('profile'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		ndex: index('peopleIndex')
			.on(table.id),
	};
});

export const playlistTrack = sqliteTable('playlist_track', {
	playlistId: text('playlist_id')
		.notNull()
		.references(() => playlists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		pk0: primaryKey(table.playlistId, table.trackId),
	};
});

export const playlists = sqliteTable('playlists', {
	id: text('id')
		.primaryKey(),
	userId: text('user_id')
		.notNull(),
	name: text('name')
		.notNull(),
	description: text('description'),
	cover: text('cover'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('playlists_unique')
			.on(table.userId, table.id),
		index: index('playlists_index')
			.on(table.id),
	};
});

export const priorityProvider = sqliteTable('priority_provider', {
	priority: integer('priority')
		.notNull(),
	country: text('country')
		.notNull(),
	providerId: integer('provider_id')
		.notNull()
		.references(() => providers.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.country, table.providerId),
	};
});

export const providers = sqliteTable('providers', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	providerName: text('provider_name')
		.notNull(),
	logoPath: text('logo_path'),
	displayPriority: integer('display_priority')
		.notNull(),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		index: index('providers_index')
			.on(table.id),
	};
});

export const recommendations = sqliteTable('recommendations', {
	id: text('id')
		.primaryKey(),
	backdrop: text('backdrop'),
	overview: text('overview'),
	poster: text('poster'),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	mediaId: integer('media_id'),
	tvFromId: integer('tvFrom_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvToId: integer('tvTo_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieFromId: integer('movieFrom_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieToId: integer('movieTo_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		movieUnique: uniqueIndex('recommendations_movie_unique')
			.on(table.mediaId, table.movieFromId),
		tvUnique: uniqueIndex('recommendations_tv_unique')
			.on(table.mediaId, table.tvFromId),
		index: index('recommendations_index')
			.on(table.id, table.mediaId, table.tvFromId, table.tvToId, table.movieFromId, table.movieToId),
	};
});

export const roles = sqliteTable('roles', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	creditId: text('credit_id')
		.notNull(),
	character: text('character')
		.notNull(),
	episodeCount: integer('episodeCount'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	castId: text('cast_id')
		.references(() => casts.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	guestId: text('guest_id')
		.references(() => guestStars.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		guestUnique: uniqueIndex('roles_guest_unique')
			.on(table.creditId, table.guestId),
		roleUnique: uniqueIndex('roles_role_unique')
			.on(table.creditId, table.castId),
		index: index('roles_index')
			.on(table.id),
	};
});

export const runningTasks = sqliteTable('runningTasks', {
	id: text('id')
		.primaryKey(),
	title: text('title')
		.notNull(),
	value: integer('value')
		.notNull(),
	type: text('type')
		.notNull(),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('runningTasks_unique')
			.on(table.title, table.type),
	};
});

export const seasons = sqliteTable('seasons', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	title: text('title'),
	airDate: text('airDate'),
	episodeCount: integer('episodeCount'),
	overview: text('overview'),
	poster: text('poster'),
	seasonNumber: integer('seasonNumber')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	tvId: integer('tv_id')
		.notNull()
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		tvIdIdx: index('tvId_idx')
			.on(table.tvId),
		seasonIndex: index('seasonIndex')
			.on(table.id),
	};
});

export const similars = sqliteTable('similars', {
	id: text('id')
		.primaryKey(),
	backdrop: text('backdrop'),
	overview: text('overview'),
	poster: text('poster'),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	mediaId: integer('media_id'),
	tvFromId: integer('tvFrom_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvToId: integer('tvTo_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieFromId: integer('movieFrom_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieToId: integer('movieTo_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		movieUnique: uniqueIndex('similars_movie_unique')
			.on(table.mediaId, table.movieFromId),
		tvUnique: uniqueIndex('similars_tv_unique')
			.on(table.mediaId, table.tvFromId),
		index: index('similars_index')
			.on(table.id, table.mediaId, table.tvFromId, table.tvToId, table.movieFromId, table.movieToId),
	};
});

export const specialItems = sqliteTable('specialItems', {
	order: integer('order'),
	specialId: text('special_id')
		.notNull()
		.references(() => specials.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		specialItemMovieUnique: uniqueIndex('specialItem_movie_unique')
			.on(table.specialId, table.movieId),
		specialItemEpisodeUnique: uniqueIndex('specialItem_episode_unique')
			.on(table.specialId, table.episodeId),
	};
});

export const specials = sqliteTable('specials', {
	id: text('id')
		.primaryKey(),
	backdrop: text('backdrop'),
	description: text('description'),
	poster: text('poster'),
	logo: text('logo'),
	title: text('title')
		.notNull(),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	creator: text('creator'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('specials_unique')
			.on(table.title),
		index: index('specials_index')
			.on(table.id),
	};
});

export const trackUser = sqliteTable('track_user', {
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	trackId: text('track_id')
		.notNull()
		.references(() => tracks.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.trackId, table.userId),
	};
});

export const tracks = sqliteTable('tracks', {
	id: text('id')
		.primaryKey()
		.notNull(),
	name: text('name'),
	track: integer('track'),
	disc: integer('disc'),
	cover: text('cover'),
	date: text('date'),
	folder: text('folder'),
	filename: text('filename'),
	duration: text('duration'),
	quality: integer('quality'),
	path: text('path'),
	lyrics: text('lyrics'),
	colorPalette: text('colorPalette'),
	blurHash: text('blurHash'),
	folderId: text('folder_id')
		.notNull()
		.references(() => folders.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
}, (table) => {
	return {
		unique: uniqueIndex('tracks_unique')
			.on(table.filename, table.path),
		index: index('tracks_index')
			.on(table.id),
	};
});

export const translations = sqliteTable('translations', {
	id: text('id')
		.primaryKey(),
	iso31661: text('iso31661')
		.notNull(),
	iso6391: text('iso6391')
		.notNull(),
	name: text('name'),
	englishName: text('englishName'),
	title: text('title'),
	overview: text('overview'),
	homepage: text('homepage'),
	biography: text('biography'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	tvId: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	seasonId: integer('season_id')
		.references(() => seasons.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	collectionId: integer('collection_id')
		.references(() => collections.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	personId: integer('person_id')
		.references(() => people.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		personUnique: uniqueIndex('translations_person_unique')
			.on(table.personId, table.iso31661, table.iso6391),
		collectionUnique: uniqueIndex('translations_collection_unique')
			.on(table.collectionId, table.iso31661, table.iso6391),
		movieUnique: uniqueIndex('translations_movie_unique')
			.on(table.movieId, table.iso31661, table.iso6391),
		episodeUnique: uniqueIndex('translations_episode_unique')
			.on(table.episodeId, table.iso31661, table.iso6391),
		seasonUnique: uniqueIndex('translations_season_unique')
			.on(table.seasonId, table.iso31661, table.iso6391),
		tvUnique: uniqueIndex('translations_tv_unique')
			.on(table.tvId, table.iso31661, table.iso6391),
		index: index('translations_index')
			.on(table.episodeId, table.movieId, table.personId, table.seasonId, table.tvId),
	};
});

export const tvs = sqliteTable('tvs', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	title: text('title')
		.notNull(),
	titleSort: text('titleSort')
		.notNull(),
	haveEpisodes: integer('haveEpisodes'),
	folder: text('folder'),
	backdrop: text('backdrop'),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	duration: integer('duration'),
	firstAirDate: text('firstAirDate'),
	homepage: text('homepage'),
	imdbId: text('imdbId'),
	inProduction: numeric('inProduction'),
	lastEpisodeToAir: integer('lastEpisodeToAir'),
	lastAirDate: text('lastAirDate'),
	mediaType: text('mediaType'),
	nextEpisodeToAir: integer('nextEpisodeToAir'),
	numberOfEpisodes: integer('numberOfEpisodes')
		.default(0),
	numberOfSeasons: integer('numberOfSeasons')
		.default(0),
	originCountry: text('originCountry'),
	originalLanguage: text('originalLanguage'),
	overview: text('overview'),
	popularity: real('popularity'),
	poster: text('poster'),
	spokenLanguages: text('spokenLanguages'),
	status: text('status'),
	tagline: text('tagline'),
	trailer: text('trailer'),
	tvdbId: integer('tvdbId'),
	type: text('type'),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	voteAverage: real('voteAverage'),
	voteCount: integer('voteCount'),
	blurHash: text('blurHash'),
	colorPalette: text('colorPalette'),
	libraryId: text('library_id')
		.notNull()
		.references(() => libraries.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		tvUnique: uniqueIndex('tvUnique')
			.on(table.id),
		tvIndex: index('tvIndex')
			.on(table.id),
	};
});

export const userData = sqliteTable('userData', {
	id: integer('id')
		.primaryKey({ autoIncrement: true })
		.notNull(),
	rating: integer('rating'),
	played: integer('played'),
	playCount: integer('playCount'),
	isFavorite: integer('isFavorite'),
	playbackPositionTicks: integer('playbackPositionTicks'),
	lastPlayedDate: text('lastPlayedDate'),
	audio: text('audio'),
	subtitle: text('subtitle'),
	subtitleType: text('subtitleType'),
	time: integer('time'),
	type: text('type'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	tvId: integer('tv_id')
		.references(() => tvs.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	specialId: integer('special_id')
		.references(() => specials.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	videoFileId: integer('videoFile_id')
		.references(() => videoFiles.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		specialUnique: uniqueIndex('userData_special_unique')
			.on(table.specialId, table.tvId, table.videoFileId, table.userId),
		movieUnique: uniqueIndex('userData_movie_unique')
			.on(table.movieId, table.videoFileId, table.userId),
		tvUnique: uniqueIndex('userData_tv_unique')
			.on(table.tvId, table.videoFileId, table.userId),
		index: index('userData_index')
			.on(table.tvId, table.movieId, table.videoFileId, table.userId),
	};
});

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.notNull(),
	email: text('email')
		.notNull(),
	manage: numeric('manage'),
	owner: numeric('owner'),
	name: text('name')
		.notNull(),
	allowed: boolean('allowed')
		.default(true),
	audioTranscoding: boolean('audioTranscoding')
		.default(true),
	videoTranscoding: boolean('videoTranscoding')
		.default(true),
	noTranscoding: boolean('noTranscoding')
		.default(true),
	createdAt: numeric('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: numeric('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

export const videoFiles = sqliteTable('videoFiles', {
	id: text('id')
		.primaryKey(),
	duration: text('duration'),
	filename: text('filename')
		.notNull(),
	folder: text('folder')
		.notNull(),
	hostFolder: text('hostFolder')
		.notNull(),
	languages: text('languages'),
	quality: text('quality'),
	share: text('share')
		.default('Media')
		.notNull(),
	subtitles: text('subtitles'),
	chapters: text('chapters'),
	createdAt: text('created_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	updatedAt: text('updated_at')
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
	episodeId: integer('episode_id')
		.references(() => episodes.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	movieId: integer('movie_id')
		.references(() => movies.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		unique: uniqueIndex('videoFiles_unique')
			.on(table.filename),
		index: index('videoFiles_index')
			.on(table.id),
	};
});

export const artistMusicGenre = sqliteTable('artist_musicGenre', {
	musicGenreId: text('musicGenre_id')
		.notNull()
		.references(() => musicGenres.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	artistId: text('artist_id')
		.notNull()
		.references(() => artists.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.artistId, table.musicGenreId),
	};
});

export const albumMusicGenre = sqliteTable('album_musicGenre', {
	musicGenreId: text('musicGenre_id')
		.notNull()
		.references(() => musicGenres.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
	albumId: text('album_id')
		.notNull()
		.references(() => albums.id, {
			onDelete: 'cascade',
			onUpdate: 'cascade',
		}),
}, (table) => {
	return {
		pk0: primaryKey(table.albumId, table.musicGenreId),
	};
});
