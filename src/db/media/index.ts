import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as activityLogs from './schema/activityLogs';
import * as album_artist from './schema/album_artist';
import * as album_library from './schema/album_library';
import * as album_musicGenre from './schema/album_musicGenre';
import * as album_track from './schema/album_track';
import * as albums from './schema/albums';
import * as alternativeTitles from './schema/alternativeTitles';
import * as artist_library from './schema/artist_library';
import * as artist_musicGenre from './schema/artist_musicGenre';
import * as artist_track from './schema/artist_track';
import * as artists from './schema/artists';
import * as casts from './schema/casts';
import * as certification_movie from './schema/certification_movie';
import * as certification_tv from './schema/certification_tv';
import * as certifications from './schema/certifications';
import * as collection_library from './schema/collection_library';
import * as collection_movie from './schema/collection_movie';
import * as collections from './schema/collections';
import * as configuration from './schema/configuration';
import * as countries from './schema/countries';
import * as creators from './schema/creators';
import * as crews from './schema/crews';
import * as devices from './schema/devices';
import * as encoderProfile_library from './schema/encoderProfile_library';
import * as encoderProfiles from './schema/encoderProfiles';
import * as episodes from './schema/episodes';
import * as file_library from './schema/file_library';
import * as file_movie from './schema/file_movie';
import * as files from './schema/files';
import * as folder_library from './schema/folder_library';
import * as folders from './schema/folders';
import * as genre_movie from './schema/genre_movie';
import * as genre_tv from './schema/genre_tv';
import * as genres from './schema/genres';
import * as guestStars from './schema/guestStars';
import * as images from './schema/images';
import * as jobs from './schema/jobs';
import * as keyword_movie from './schema/keyword_movie';
import * as keyword_tv from './schema/keyword_tv';
import * as keywords from './schema/keywords';
import * as language_library from './schema/language_library';
import * as languages from './schema/languages';
import * as libraries from './schema/libraries';
import * as library_movie from './schema/library_movie';
import * as library_tv from './schema/library_tv';
import * as library_user from './schema/library_user';
import * as mediaAttachments from './schema/mediaAttachments';
import * as medias from './schema/medias';
import * as mediaStreams from './schema/mediaStreams';
import * as messages from './schema/messages';
import * as metadata from './schema/metadata';
import * as movies from './schema/movies';
import * as musicGenre_track from './schema/musicGenre_track';
import * as musicGenres from './schema/musicGenres';
import * as notification_user from './schema/notification_user';
import * as notifications from './schema/notifications';
import * as people from './schema/people';
import * as playlist_track from './schema/playlist_track';
import * as playlists from './schema/playlists';
import * as priority_provider from './schema/priority_provider';
import * as providers from './schema/providers';
import * as recommendations from './schema/recommendations';
import * as roles from './schema/roles';
import * as runningTasks from './schema/runningTasks';
import * as seasons from './schema/seasons';
import * as similars from './schema/similars';
import * as specialItems from './schema/specialItems';
import * as specials from './schema/specials';
import * as track_user from './schema/track_user';
import * as tracks from './schema/tracks';
import * as translations from './schema/translations';
import * as tvs from './schema/tvs';
import * as userData from './schema/userData';
import * as users from './schema/users';
import * as videoFiles from './schema/videoFiles';

import { MyLogger } from '../helpers';
import { mediaDbFile } from '@server/state';

export const mediaDbSchema = {
	...activityLogs,
	...album_artist,
	...album_library,
	...album_musicGenre,
	...album_track,
	...albums,
	...alternativeTitles,
	...artist_library,
	...artist_musicGenre,
	...artist_track,
	...artists,
	...casts,
	...certification_movie,
	...certification_tv,
	...certifications,
	...collection_library,
	...collection_movie,
	...collections,
	...configuration,
	...countries,
	...creators,
	...crews,
	...devices,
	...encoderProfile_library,
	...encoderProfiles,
	...episodes,
	...file_library,
	...file_movie,
	...files,
	...folder_library,
	...folders,
	...genre_movie,
	...genre_tv,
	...genres,
	...guestStars,
	...images,
	...jobs,
	...keyword_movie,
	...keyword_tv,
	...keywords,
	...language_library,
	...languages,
	...libraries,
	...library_movie,
	...library_tv,
	...library_user,
	...mediaAttachments,
	...medias,
	...mediaStreams,
	...messages,
	...metadata,
	...movies,
	...musicGenre_track,
	...musicGenres,
	...notification_user,
	...notifications,
	...people,
	...playlist_track,
	...playlists,
	...priority_provider,
	...providers,
	...recommendations,
	...roles,
	...runningTasks,
	...seasons,
	...similars,
	...specialItems,
	...specials,
	...track_user,
	...tracks,
	...translations,
	...tvs,
	...userData,
	...users,
	...videoFiles,
};

const media = new Database(mediaDbFile, {
	timeout: 100000,
	// verbose: console.log,
});

export const mediaDb: BetterSQLite3Database<typeof mediaDbSchema> = drizzle(media, {
	schema: mediaDbSchema,
	logger: new MyLogger(),
});
