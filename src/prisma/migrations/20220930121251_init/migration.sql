-- CreateTable
CREATE TABLE "Configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "modified_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "autoRefreshInterval" TEXT NOT NULL,
    "chapterImages" BOOLEAN NOT NULL,
    "extractChapters" BOOLEAN NOT NULL,
    "extractChaptersDuring" BOOLEAN NOT NULL,
    "image" TEXT,
    "perfectSubtitleMatch" BOOLEAN NOT NULL,
    "realtime" BOOLEAN NOT NULL,
    "specialSeasonName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "EncoderProfileLibrary" (
    "libraryId" TEXT NOT NULL,
    "encoderProfileId" TEXT NOT NULL,

    PRIMARY KEY ("libraryId", "encoderProfileId"),
    CONSTRAINT "EncoderProfileLibrary_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EncoderProfileLibrary_encoderProfileId_fkey" FOREIGN KEY ("encoderProfileId") REFERENCES "EncoderProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EncoderProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "container" TEXT NOT NULL,
    "param" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "SubtitleLanguage" (
    "libraryId" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    CONSTRAINT "SubtitleLanguage_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubtitleLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso_639_1" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "libraryId" TEXT,
    CONSTRAINT "Metadata_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryFolder" (
    "libraryId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    CONSTRAINT "LibraryFolder_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LibraryFolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "metadataId" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "Provider_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "Metadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso31661" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "from" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deviceId" TEXT NOT NULL,
    "sub_id" TEXT NOT NULL,
    CONSTRAINT "ActivityLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "RunningTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "LibraryUser" (
    "libraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LibraryUser_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LibraryUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("sub_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "sub_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "manage" BOOLEAN DEFAULT false,
    "owner" BOOLEAN DEFAULT false,
    "name" TEXT NOT NULL,
    "allowed" BOOLEAN DEFAULT true,
    "audioTranscoding" BOOLEAN DEFAULT true,
    "videoTranscoding" BOOLEAN DEFAULT true,
    "noTranscoding" BOOLEAN DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "NotificationTypes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manage" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "NotificationTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("sub_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "ep_folder" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "atimeMs" REAL NOT NULL,
    "mtimeMs" REAL NOT NULL,
    "ctimeMs" REAL NOT NULL,
    "birthtimeMs" REAL NOT NULL,
    "title" TEXT NOT NULL,
    "Chapters" TEXT,
    "regex" TEXT,
    "ffprobe" TEXT,
    "season_num" BIGINT,
    "ep_num" BIGINT,
    "extra_info" TEXT,
    "year" BIGINT,
    "release_group" TEXT,
    "ep_ab_num" TEXT,
    "codec" TEXT,
    "crc" TEXT,
    "mode" BIGINT NOT NULL,
    "nlink" BIGINT NOT NULL,
    "uid" BIGINT NOT NULL,
    "gid" BIGINT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("path", "libraryId"),
    CONSTRAINT "File_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "File_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaAttachments" (
    "ItemId" TEXT NOT NULL PRIMARY KEY,
    "Type" INTEGER NOT NULL,
    "Value" TEXT NOT NULL,
    "CleanValue" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaAttachments_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mediastreams" (
    "ItemId" TEXT NOT NULL PRIMARY KEY,
    "StreamIndex" INTEGER NOT NULL,
    "StreamType" TEXT NOT NULL,
    "Codec" TEXT NOT NULL,
    "Language" TEXT NOT NULL,
    "ChannelLayout" TEXT NOT NULL,
    "Profile" TEXT NOT NULL,
    "AspectRatio" TEXT NOT NULL,
    "Path" TEXT NOT NULL,
    "IsIntrlaced" BOOLEAN NOT NULL,
    "BitRate" INTEGER NOT NULL,
    "Channels" INTEGER NOT NULL,
    "SampleRate" INTEGER NOT NULL,
    "IsDefault" BOOLEAN NOT NULL,
    "IsForced" BOOLEAN NOT NULL,
    "IsExternal" BOOLEAN NOT NULL,
    "Height" INTEGER NOT NULL,
    "Width" INTEGER NOT NULL,
    "AverageFrameRate" INTEGER NOT NULL,
    "RealFrameRate" INTEGER NOT NULL,
    "Level" INTEGER NOT NULL,
    "PixelFormat" TEXT NOT NULL,
    "BitDepth" INTEGER NOT NULL,
    "IsAnamorphic" BOOLEAN NOT NULL,
    "RefFrames" INTEGER NOT NULL,
    "CodecTag" TEXT NOT NULL,
    "Comment" TEXT NOT NULL,
    "NalLengthSize" TEXT NOT NULL,
    "IsAvc" BOOLEAN NOT NULL,
    "Title" TEXT NOT NULL,
    "TimeBase" TEXT NOT NULL,
    "CodecTimeBase" TEXT NOT NULL,
    "ColorPrimaries" TEXT NOT NULL,
    "ColorSpace" TEXT NOT NULL,
    "ColorTransfer" TEXT NOT NULL,
    "DvVersionMajor" INTEGER NOT NULL,
    "DvVersionMinor" INTEGER NOT NULL,
    "DvProfile" INTEGER NOT NULL,
    "DvLevel" INTEGER NOT NULL,
    "RpuPresentFlag" INTEGER NOT NULL,
    "ElPresentFlag" INTEGER NOT NULL,
    "BlPresentFlag" INTEGER NOT NULL,
    "DvBlSignalCompatibilityId" INTEGER NOT NULL,
    "KeyFrames" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mediastreams_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserData" (
    "id" TEXT NOT NULL,
    "rating" REAL,
    "played" BOOLEAN,
    "playCount" INTEGER,
    "isFavorite" BOOLEAN,
    "playbackPositionTicks" BIGINT,
    "lastPlayedDate" DATETIME,
    "audio" TEXT,
    "subtitle" TEXT,
    "subtitleType" TEXT,
    "time" INTEGER,
    "sub_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "movieId" INTEGER,
    "tvId" INTEGER,
    "videoFileId" INTEGER,
    CONSTRAINT "UserData_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserData_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserData_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserData_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlternativeTitles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso31661" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "movieId" INTEGER,
    "tvId" INTEGER,
    CONSTRAINT "AlternativeTitles_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlternativeTitles_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cast" (
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "character" TEXT,
    "creditId" TEXT NOT NULL,
    "gender" INTEGER,
    "id" TEXT NOT NULL PRIMARY KEY,
    "knownForDepartment" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER,
    "originalName" TEXT,
    "popularity" REAL,
    "profilePath" TEXT,
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Cast_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CastEpisode" (
    "creditId" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "episodeId"),
    CONSTRAINT "CastEpisode_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Cast" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CastEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CastMovie" (
    "creditId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "movieId"),
    CONSTRAINT "CastMovie_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Cast" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CastMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CastSeason" (
    "creditId" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "seasonId"),
    CONSTRAINT "CastSeason_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Cast" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CastSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CastTv" (
    "creditId" TEXT NOT NULL,
    "tvId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "tvId"),
    CONSTRAINT "CastTv_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Cast" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CastTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso31661" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "rating" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CertificationMovie" (
    "iso31661" TEXT NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    PRIMARY KEY ("movieId", "iso31661"),
    CONSTRAINT "CertificationMovie_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CertificationMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificationTv" (
    "iso31661" TEXT NOT NULL,
    "certificationId" INTEGER NOT NULL,
    "tvId" INTEGER NOT NULL,

    PRIMARY KEY ("tvId", "iso31661"),
    CONSTRAINT "CertificationTv_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CertificationTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Collection" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "parts" INTEGER,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Collection_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionMovie" (
    "collectionId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    PRIMARY KEY ("collectionId", "movieId"),
    CONSTRAINT "CollectionMovie_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creator" (
    "creditId" TEXT NOT NULL,
    "gender" INTEGER,
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profilePath" TEXT,
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Creator_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreatorTv" (
    "creditId" TEXT NOT NULL,
    "tvId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "tvId"),
    CONSTRAINT "CreatorTv_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Creator" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Crew" (
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "creditId" TEXT NOT NULL,
    "department" TEXT,
    "gender" INTEGER,
    "id" TEXT NOT NULL PRIMARY KEY,
    "job" TEXT,
    "knownForDepartment" TEXT,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "popularity" REAL,
    "profilePath" TEXT,
    "profileId" INTEGER,
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Crew_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewEpisode" (
    "creditId" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "episodeId"),
    CONSTRAINT "CrewEpisode_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Crew" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrewEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewMovie" (
    "creditId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "movieId"),
    CONSTRAINT "CrewMovie_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Crew" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrewMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewSeason" (
    "creditId" TEXT NOT NULL,
    "seasonId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "seasonId"),
    CONSTRAINT "CrewSeason_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Crew" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrewSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrewTv" (
    "creditId" TEXT NOT NULL,
    "tvId" INTEGER NOT NULL,

    PRIMARY KEY ("creditId", "tvId"),
    CONSTRAINT "CrewTv_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Crew" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrewTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Episode" (
    "airDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "episodeNumber" INTEGER NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imdbId" TEXT,
    "overview" TEXT,
    "productionCode" TEXT,
    "seasonNumber" INTEGER NOT NULL,
    "still" TEXT,
    "title" TEXT NOT NULL,
    "tvdbId" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "tvId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    CONSTRAINT "Episode_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EpisodeGuestStar" (
    "episodeId" INTEGER NOT NULL,
    "creditId" TEXT NOT NULL,

    PRIMARY KEY ("creditId", "episodeId"),
    CONSTRAINT "EpisodeGuestStar_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EpisodeGuestStar_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "GuestStar" ("creditId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FailedJobs" (
    "connnection" TEXT,
    "exception" TEXT NOT NULL,
    "failedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "uuid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "GenreMovie" (
    "genreId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    PRIMARY KEY ("genreId", "movieId"),
    CONSTRAINT "GenreMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GenreMovie_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenreTv" (
    "genreId" INTEGER NOT NULL,
    "tvId" INTEGER NOT NULL,

    PRIMARY KEY ("genreId", "tvId"),
    CONSTRAINT "GenreTv_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GenreTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuestStar" (
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "castId" INTEGER,
    "character" TEXT,
    "creditId" TEXT NOT NULL,
    "episodeId" INTEGER NOT NULL,
    "gender" INTEGER,
    "id" TEXT NOT NULL PRIMARY KEY,
    "knownForDepartment" TEXT,
    "name" TEXT,
    "order" INTEGER,
    "originalName" TEXT,
    "popularity" REAL,
    "profilePath" TEXT,
    "profileId" INTEGER,
    "personId" INTEGER NOT NULL,
    CONSTRAINT "GuestStar_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Jobs" (
    "attempts" INTEGER,
    "availableAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payload" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "reservedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keywordId" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "KeywordMovie" (
    "keywordId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    CONSTRAINT "KeywordMovie_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("keywordId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KeywordMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeywordTv" (
    "keywordId" INTEGER NOT NULL,
    "tvId" INTEGER NOT NULL,
    CONSTRAINT "KeywordTv_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("keywordId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KeywordTv_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Messages" (
    "body" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT,
    "notify" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "duration" TEXT,
    "show" BOOLEAN NOT NULL DEFAULT false,
    "folder" TEXT,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "backdrop" TEXT,
    "budget" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homepage" TEXT,
    "imdbId" TEXT,
    "originalTitle" TEXT,
    "originalLanguage" TEXT,
    "overview" TEXT,
    "popularity" REAL,
    "poster" TEXT,
    "releaseDate" TEXT NOT NULL,
    "revenue" INTEGER,
    "runtime" INTEGER,
    "status" TEXT,
    "tagline" TEXT,
    "trailer" TEXT,
    "tvdbId" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    "video" TEXT,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Movie_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Person" (
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "alsoKnownAs" TEXT,
    "biography" TEXT,
    "birthday" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "deathday" TEXT,
    "gender" INTEGER NOT NULL DEFAULT 0,
    "homepage" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imdbId" TEXT,
    "knownForDepartment" TEXT,
    "name" TEXT,
    "placeOfBirth" TEXT,
    "popularity" REAL,
    "profilePath" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "recommendationableId" INTEGER NOT NULL,
    "recommendationableType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Season" (
    "airDate" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "episodeCount" INTEGER,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "tvId" INTEGER NOT NULL,
    CONSTRAINT "Season_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Similar" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "similarableId" INTEGER NOT NULL,
    "similarableType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Special" (
    "backdrop" TEXT,
    "description" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Special_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpecialItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "specialId" INTEGER,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    CONSTRAINT "SpecialItem_specialId_fkey" FOREIGN KEY ("specialId") REFERENCES "Special" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Translation" (
    "biography" TEXT,
    "englishName" TEXT,
    "homepage" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso31661" TEXT NOT NULL,
    "iso6391" TEXT NOT NULL,
    "name" TEXT,
    "overview" TEXT,
    "title" TEXT,
    "translationableId" INTEGER NOT NULL,
    "translationableType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tv" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "haveEpisodes" INTEGER DEFAULT 0,
    "folder" TEXT,
    "backdrop" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "firstAirDate" TEXT NOT NULL,
    "homepage" TEXT,
    "imdbId" TEXT,
    "inProduction" BOOLEAN NOT NULL DEFAULT false,
    "lastEpisodeToAir" INTEGER,
    "lastAirDate" TEXT,
    "mediaType" TEXT,
    "nextEpisodeToAir" INTEGER,
    "numberOfEpisodes" INTEGER DEFAULT 0,
    "numberOfSeasons" INTEGER DEFAULT 0,
    "originCountry" TEXT,
    "originalLanguage" TEXT,
    "overview" TEXT,
    "popularity" REAL,
    "poster" TEXT,
    "spokenLanguages" TEXT,
    "status" TEXT,
    "tagline" TEXT,
    "trailer" TEXT,
    "tvdbId" INTEGER,
    "type" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Tv_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoFile" (
    "duration" TEXT,
    "filename" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "hostFolder" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "languages" TEXT,
    "quality" TEXT,
    "share" TEXT NOT NULL DEFAULT 'Media',
    "subtitles" TEXT,
    "Chapters" TEXT,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoFile_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoFile_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aspectRatio" REAL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "height" INTEGER,
    "iso6391" TEXT,
    "name" TEXT,
    "site" TEXT,
    "size" INTEGER,
    "filePath" TEXT NOT NULL,
    "type" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "width" INTEGER,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "colorPalette" TEXT,
    "tvId" INTEGER,
    "movieId" INTEGER,
    CONSTRAINT "Image_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Image_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "aspectRatio" REAL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "height" INTEGER,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "iso6391" TEXT,
    "name" TEXT,
    "site" TEXT,
    "size" INTEGER,
    "src" TEXT NOT NULL,
    "type" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "width" INTEGER,
    "colorPalette" TEXT,
    "tvId" INTEGER,
    "seasonId" INTEGER,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    "personId" INTEGER,
    "videoFileId" INTEGER,
    CONSTRAINT "Media_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Media_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_key_key" ON "Configuration"("key");

-- CreateIndex
CREATE INDEX "EncoderProfileLibrary_encoderProfileId_idx" ON "EncoderProfileLibrary"("encoderProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EncoderProfileLibrary_libraryId_encoderProfileId_key" ON "EncoderProfileLibrary"("libraryId", "encoderProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EncoderProfile_name_key" ON "EncoderProfile"("name");

-- CreateIndex
CREATE INDEX "SubtitleLanguage_languageId_idx" ON "SubtitleLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtitleLanguage_libraryId_languageId_key" ON "SubtitleLanguage"("libraryId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_iso_639_1_key" ON "Language"("iso_639_1");

-- CreateIndex
CREATE INDEX "LibraryFolder_folderId_idx" ON "LibraryFolder"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryFolder_libraryId_folderId_key" ON "LibraryFolder"("libraryId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_path_key" ON "Folder"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso31661_key" ON "Country"("iso31661");

-- CreateIndex
CREATE INDEX "LibraryUser_userId_idx" ON "LibraryUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryUser_libraryId_userId_key" ON "LibraryUser"("libraryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTypes_name_key" ON "NotificationTypes"("name");

-- CreateIndex
CREATE INDEX "UserNotification_userId_idx" ON "UserNotification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_notificationId_userId_key" ON "UserNotification"("notificationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");

-- CreateIndex
CREATE INDEX "MediaAttachments_ItemId_Type_CleanValue_idx" ON "MediaAttachments"("ItemId", "Type", "CleanValue");

-- CreateIndex
CREATE INDEX "MediaAttachments_Type_CleanValue_ItemId_idx" ON "MediaAttachments"("Type", "CleanValue", "ItemId");

-- CreateIndex
CREATE INDEX "MediaAttachments_Type_ItemId_Value_idx" ON "MediaAttachments"("Type", "ItemId", "Value");

-- CreateIndex
CREATE INDEX "Mediastreams_ItemId_StreamIndex_idx" ON "Mediastreams"("ItemId", "StreamIndex");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_id_key" ON "UserData"("id");

-- CreateIndex
CREATE INDEX "UserData_tvId_movieId_videoFileId_sub_id_idx" ON "UserData"("tvId", "movieId", "videoFileId", "sub_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_tvId_videoFileId_sub_id_key" ON "UserData"("tvId", "videoFileId", "sub_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserData_movieId_videoFileId_sub_id_key" ON "UserData"("movieId", "videoFileId", "sub_id");

-- CreateIndex
CREATE INDEX "alternative_titles_movie_index" ON "AlternativeTitles"("movieId");

-- CreateIndex
CREATE INDEX "alternative_titles_tv_index" ON "AlternativeTitles"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "AlternativeTitles_iso31661_movieId_key" ON "AlternativeTitles"("iso31661", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "AlternativeTitles_iso31661_tvId_key" ON "AlternativeTitles"("iso31661", "tvId");

-- CreateIndex
CREATE UNIQUE INDEX "Cast_creditId_key" ON "Cast"("creditId");

-- CreateIndex
CREATE INDEX "Cast_id_idx" ON "Cast"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cast_id_creditId_key" ON "Cast"("id", "creditId");

-- CreateIndex
CREATE INDEX "CastEpisode_episodeId_idx" ON "CastEpisode"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "CastEpisode_creditId_key" ON "CastEpisode"("creditId");

-- CreateIndex
CREATE INDEX "CastMovie_movieId_idx" ON "CastMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "CastMovie_creditId_key" ON "CastMovie"("creditId");

-- CreateIndex
CREATE INDEX "CastSeason_seasonId_idx" ON "CastSeason"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "CastSeason_creditId_key" ON "CastSeason"("creditId");

-- CreateIndex
CREATE INDEX "CastTv_tvId_idx" ON "CastTv"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "CastTv_creditId_key" ON "CastTv"("creditId");

-- CreateIndex
CREATE INDEX "Certification_id_idx" ON "Certification"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_rating_iso31661_key" ON "Certification"("rating", "iso31661");

-- CreateIndex
CREATE INDEX "CertificationMovie_movieId_idx" ON "CertificationMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationMovie_movieId_iso31661_key" ON "CertificationMovie"("movieId", "iso31661");

-- CreateIndex
CREATE INDEX "CertificationTv_tvId_idx" ON "CertificationTv"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationTv_tvId_iso31661_key" ON "CertificationTv"("tvId", "iso31661");

-- CreateIndex
CREATE INDEX "Collection_id_idx" ON "Collection"("id");

-- CreateIndex
CREATE INDEX "CollectionMovie_movieId_idx" ON "CollectionMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionMovie_collectionId_movieId_key" ON "CollectionMovie"("collectionId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_creditId_key" ON "Creator"("creditId");

-- CreateIndex
CREATE INDEX "Creator_id_idx" ON "Creator"("id");

-- CreateIndex
CREATE INDEX "CreatorTv_tvId_idx" ON "CreatorTv"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorTv_creditId_key" ON "CreatorTv"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Crew_creditId_key" ON "Crew"("creditId");

-- CreateIndex
CREATE INDEX "Crew_id_idx" ON "Crew"("id");

-- CreateIndex
CREATE INDEX "CrewEpisode_episodeId_idx" ON "CrewEpisode"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewEpisode_creditId_key" ON "CrewEpisode"("creditId");

-- CreateIndex
CREATE INDEX "CrewMovie_movieId_idx" ON "CrewMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewMovie_creditId_key" ON "CrewMovie"("creditId");

-- CreateIndex
CREATE INDEX "CrewSeason_seasonId_idx" ON "CrewSeason"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewSeason_creditId_key" ON "CrewSeason"("creditId");

-- CreateIndex
CREATE INDEX "CrewTv_tvId_idx" ON "CrewTv"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "CrewTv_creditId_key" ON "CrewTv"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_id_key" ON "Episode"("id");

-- CreateIndex
CREATE INDEX "Episode_id_idx" ON "Episode"("id");

-- CreateIndex
CREATE INDEX "EpisodeGuestStar_episodeId_idx" ON "EpisodeGuestStar"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeGuestStar_creditId_key" ON "EpisodeGuestStar"("creditId");

-- CreateIndex
CREATE INDEX "GenreMovie_movieId_idx" ON "GenreMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "GenreMovie_genreId_movieId_key" ON "GenreMovie"("genreId", "movieId");

-- CreateIndex
CREATE INDEX "GenreTv_tvId_idx" ON "GenreTv"("tvId");

-- CreateIndex
CREATE UNIQUE INDEX "GenreTv_genreId_tvId_key" ON "GenreTv"("genreId", "tvId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestStar_creditId_key" ON "GuestStar"("creditId");

-- CreateIndex
CREATE INDEX "GuestStar_episodeId_idx" ON "GuestStar"("episodeId");

-- CreateIndex
CREATE INDEX "Keyword_keywordId_idx" ON "Keyword"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_keywordId_key" ON "Keyword"("keywordId");

-- CreateIndex
CREATE INDEX "keyword_movie_index" ON "KeywordMovie"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordMovie_keywordId_movieId_key" ON "KeywordMovie"("keywordId", "movieId");

-- CreateIndex
CREATE INDEX "keyword_tv_index" ON "KeywordTv"("keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordTv_keywordId_tvId_key" ON "KeywordTv"("keywordId", "tvId");

-- CreateIndex
CREATE INDEX "Movie_id_idx" ON "Movie"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE INDEX "Genre_id_idx" ON "Genre"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_id_key" ON "Genre"("id");

-- CreateIndex
CREATE INDEX "Person_id_idx" ON "Person"("id");

-- CreateIndex
CREATE INDEX "Recommendation_recommendationableId_recommendationableType_idx" ON "Recommendation"("recommendationableId", "recommendationableType");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_recommendationableId_recommendationableType_mediaId_mediaType_key" ON "Recommendation"("recommendationableId", "recommendationableType", "mediaId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "Season_id_key" ON "Season"("id");

-- CreateIndex
CREATE INDEX "Season_tvId_idx" ON "Season"("tvId");

-- CreateIndex
CREATE INDEX "Similar_similarableId_similarableType_idx" ON "Similar"("similarableId", "similarableType");

-- CreateIndex
CREATE UNIQUE INDEX "Similar_similarableId_similarableType_mediaId_key" ON "Similar"("similarableId", "similarableType", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "Special_title_key" ON "Special"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialItem_episodeId_key" ON "SpecialItem"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialItem_movieId_key" ON "SpecialItem"("movieId");

-- CreateIndex
CREATE INDEX "Translation_translationableId_translationableType_idx" ON "Translation"("translationableId", "translationableType");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_translationableId_translationableType_iso6391_key" ON "Translation"("translationableId", "translationableType", "iso6391");

-- CreateIndex
CREATE UNIQUE INDEX "Tv_id_key" ON "Tv"("id");

-- CreateIndex
CREATE INDEX "Tv_id_idx" ON "Tv"("id");

-- CreateIndex
CREATE UNIQUE INDEX "VideoFile_episodeId_key" ON "VideoFile"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoFile_movieId_key" ON "VideoFile"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_filePath_key" ON "Image"("filePath");

-- CreateIndex
CREATE UNIQUE INDEX "Image_site_type_filePath_width_height_key" ON "Image"("site", "type", "filePath", "width", "height");

-- CreateIndex
CREATE UNIQUE INDEX "Media_src_key" ON "Media"("src");
