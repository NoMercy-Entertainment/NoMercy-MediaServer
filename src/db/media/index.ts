import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as activityLogs from './schema/activityLogs';
import * as albums from './schema/albums';
import * as album_artist from './schema/album_artist';
import * as album_library from './schema/album_library';
import * as album_track from './schema/album_track';
import * as alternativeTitles from './schema/alternativeTitles';
import * as artists from './schema/artists';
import * as artist_library from './schema/artist_library';
import * as artist_track from './schema/artist_track';
import * as casts from './schema/casts';
import * as certifications from './schema/certifications';
import * as certification_movie from './schema/certification_movie';
import * as certification_tv from './schema/certification_tv';
import * as collections from './schema/collections';
import * as collection_library from './schema/collection_library';
import * as collection_movie from './schema/collection_movie';
import * as configuration from './schema/configuration';
import * as countries from './schema/countries';
import * as creators from './schema/creators';
import * as crews from './schema/crews';
import * as devices from './schema/devices';
import * as encoderProfiles from './schema/encoderProfiles';
import * as encoderProfile_library from './schema/encoderProfile_library';
import * as episodes from './schema/episodes';
import * as files from './schema/files';
import * as file_library from './schema/file_library';
import * as file_movie from './schema/file_movie';
import * as folders from './schema/folders';
import * as folder_library from './schema/folder_library';
import * as genres from './schema/genres';
import * as genre_movie from './schema/genre_movie';
import * as genre_tv from './schema/genre_tv';
import * as guestStars from './schema/guestStars';
import * as images from './schema/images';
import * as jobs from './schema/jobs';
import * as keywords from './schema/keywords';
import * as keyword_movie from './schema/keyword_movie';
import * as keyword_tv from './schema/keyword_tv';
import * as languages from './schema/languages';
import * as language_library from './schema/language_library';
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
import * as musicGenres from './schema/musicGenres';
import * as musicGenre_track from './schema/musicGenre_track';
import * as notifications from './schema/notifications';
import * as notification_user from './schema/notification_user';
import * as people from './schema/people';
import * as playlists from './schema/playlists';
import * as playlist_track from './schema/playlist_track';
import * as priority_provider from './schema/priority_provider';
import * as providers from './schema/providers';
import * as recommendations from './schema/recommendations';
import * as roles from './schema/roles';
import * as runningTasks from './schema/runningTasks';
import * as seasons from './schema/seasons';
import * as similars from './schema/similars';
import * as specialItems from './schema/specialItems';
import * as specials from './schema/specials';
import * as tracks from './schema/tracks';
import * as track_user from './schema/track_user';
import * as translations from './schema/translations';
import * as tvs from './schema/tvs';
import * as userData from './schema/userData';
import * as users from './schema/users';
import * as videoFiles from './schema/videoFiles';
import { MyLogger } from '../helpers';

export const mediaDbSchema = {
	...activityLogs,
	...albums,
	...album_artist,
	...album_library,
	...album_track,
	...alternativeTitles,
	...artists,
	...artist_library,
	...artist_track,
	...casts,
	...certifications,
	...certification_movie,
	...certification_tv,
	...collections,
	...collection_library,
	...collection_movie,
	...configuration,
	...countries,
	...creators,
	...crews,
	...devices,
	...encoderProfiles,
	...encoderProfile_library,
	...episodes,
	...files,
	...file_library,
	...file_movie,
	...folders,
	...folder_library,
	...genres,
	...genre_movie,
	...genre_tv,
	...guestStars,
	...images,
	...jobs,
	...keywords,
	...keyword_movie,
	...keyword_tv,
	...languages,
	...language_library,
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
	...musicGenres,
	...musicGenre_track,
	...notifications,
	...notification_user,
	...people,
	...playlists,
	...playlist_track,
	...priority_provider,
	...providers,
	...recommendations,
	...roles,
	...runningTasks,
	...seasons,
	...similars,
	...specialItems,
	...specials,
	...tracks,
	...track_user,
	...translations,
	...tvs,
	...userData,
	...users,
	...videoFiles,
};

const media = new Database('media.db', {
	timeout: 100000,
	// verbose: console.log,
});

// @ts-ignore
export const mediaDb: BetterSQLite3Database = drizzle(media, {
	schema: mediaDbSchema,
	logger: new MyLogger(),
});
