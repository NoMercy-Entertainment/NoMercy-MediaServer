-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mediastreams" (
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
    CONSTRAINT "Mediastreams_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mediastreams" ("AspectRatio", "AverageFrameRate", "BitDepth", "BitRate", "BlPresentFlag", "ChannelLayout", "Channels", "Codec", "CodecTag", "CodecTimeBase", "ColorPrimaries", "ColorSpace", "ColorTransfer", "Comment", "DvBlSignalCompatibilityId", "DvLevel", "DvProfile", "DvVersionMajor", "DvVersionMinor", "ElPresentFlag", "Height", "IsAnamorphic", "IsAvc", "IsDefault", "IsExternal", "IsForced", "IsIntrlaced", "ItemId", "KeyFrames", "Language", "Level", "NalLengthSize", "Path", "PixelFormat", "Profile", "RealFrameRate", "RefFrames", "RpuPresentFlag", "SampleRate", "StreamIndex", "StreamType", "TimeBase", "Title", "Width", "createdAt", "fileId", "updatedAt") SELECT "AspectRatio", "AverageFrameRate", "BitDepth", "BitRate", "BlPresentFlag", "ChannelLayout", "Channels", "Codec", "CodecTag", "CodecTimeBase", "ColorPrimaries", "ColorSpace", "ColorTransfer", "Comment", "DvBlSignalCompatibilityId", "DvLevel", "DvProfile", "DvVersionMajor", "DvVersionMinor", "ElPresentFlag", "Height", "IsAnamorphic", "IsAvc", "IsDefault", "IsExternal", "IsForced", "IsIntrlaced", "ItemId", "KeyFrames", "Language", "Level", "NalLengthSize", "Path", "PixelFormat", "Profile", "RealFrameRate", "RefFrames", "RpuPresentFlag", "SampleRate", "StreamIndex", "StreamType", "TimeBase", "Title", "Width", "createdAt", "fileId", "updatedAt" FROM "Mediastreams";
DROP TABLE "Mediastreams";
ALTER TABLE "new_Mediastreams" RENAME TO "Mediastreams";
CREATE INDEX "Mediastreams_ItemId_StreamIndex_idx" ON "Mediastreams"("ItemId", "StreamIndex");
CREATE TABLE "new_Image" (
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
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "tvId" INTEGER,
    "movieId" INTEGER,
    CONSTRAINT "Image_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Image_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width") SELECT "aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_filePath_key" ON "Image"("filePath");
CREATE UNIQUE INDEX "Image_site_type_filePath_width_height_key" ON "Image"("site", "type", "filePath", "width", "height");
CREATE TABLE "new_UserData" (
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
    CONSTRAINT "UserData_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserData" ("audio", "createdAt", "id", "isFavorite", "lastPlayedDate", "movieId", "playCount", "playbackPositionTicks", "played", "rating", "sub_id", "subtitle", "subtitleType", "time", "tvId", "updatedAt", "videoFileId") SELECT "audio", "createdAt", "id", "isFavorite", "lastPlayedDate", "movieId", "playCount", "playbackPositionTicks", "played", "rating", "sub_id", "subtitle", "subtitleType", "time", "tvId", "updatedAt", "videoFileId" FROM "UserData";
DROP TABLE "UserData";
ALTER TABLE "new_UserData" RENAME TO "UserData";
CREATE UNIQUE INDEX "UserData_id_key" ON "UserData"("id");
CREATE INDEX "UserData_tvId_movieId_videoFileId_sub_id_idx" ON "UserData"("tvId", "movieId", "videoFileId", "sub_id");
CREATE UNIQUE INDEX "UserData_tvId_videoFileId_sub_id_key" ON "UserData"("tvId", "videoFileId", "sub_id");
CREATE UNIQUE INDEX "UserData_movieId_videoFileId_sub_id_key" ON "UserData"("movieId", "videoFileId", "sub_id");
CREATE TABLE "new_Crew" (
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
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Crew_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Crew" ("adult", "blurHash", "creditId", "department", "gender", "id", "job", "knownForDepartment", "name", "originalName", "personId", "popularity", "profileId", "profilePath") SELECT "adult", "blurHash", "creditId", "department", "gender", "id", "job", "knownForDepartment", "name", "originalName", "personId", "popularity", "profileId", "profilePath" FROM "Crew";
DROP TABLE "Crew";
ALTER TABLE "new_Crew" RENAME TO "Crew";
CREATE UNIQUE INDEX "Crew_creditId_key" ON "Crew"("creditId");
CREATE INDEX "Crew_id_idx" ON "Crew"("id");
CREATE TABLE "new_LibraryFolder" (
    "libraryId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    CONSTRAINT "LibraryFolder_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryFolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LibraryFolder" ("folderId", "libraryId") SELECT "folderId", "libraryId" FROM "LibraryFolder";
DROP TABLE "LibraryFolder";
ALTER TABLE "new_LibraryFolder" RENAME TO "LibraryFolder";
CREATE INDEX "LibraryFolder_folderId_idx" ON "LibraryFolder"("folderId");
CREATE UNIQUE INDEX "LibraryFolder_libraryId_folderId_key" ON "LibraryFolder"("libraryId", "folderId");
CREATE TABLE "new_Cast" (
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
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Cast_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cast" ("adult", "blurHash", "character", "creditId", "gender", "id", "knownForDepartment", "name", "order", "originalName", "personId", "popularity", "profilePath") SELECT "adult", "blurHash", "character", "creditId", "gender", "id", "knownForDepartment", "name", "order", "originalName", "personId", "popularity", "profilePath" FROM "Cast";
DROP TABLE "Cast";
ALTER TABLE "new_Cast" RENAME TO "Cast";
CREATE UNIQUE INDEX "Cast_creditId_key" ON "Cast"("creditId");
CREATE INDEX "Cast_id_idx" ON "Cast"("id");
CREATE UNIQUE INDEX "Cast_id_creditId_key" ON "Cast"("id", "creditId");
CREATE TABLE "new_File" (
    "folder" TEXT NOT NULL,
    "episodeNumber" INTEGER,
    "seasonNumber" INTEGER,
    "episodeFolder" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "year" INTEGER,
    "size" REAL NOT NULL,
    "id" TEXT NOT NULL,
    "atimeMs" REAL NOT NULL,
    "birthtimeMs" REAL NOT NULL,
    "ctimeMs" REAL NOT NULL,
    "edition" TEXT,
    "resolution" TEXT,
    "videoCodec" TEXT,
    "audioCodec" TEXT,
    "audioChannels" TEXT,
    "ffprobe" TEXT,
    "chapters" TEXT,
    "fullSeason" BOOLEAN,
    "gid" REAL NOT NULL,
    "group" TEXT,
    "airDate" DATETIME,
    "multi" BOOLEAN,
    "complete" BOOLEAN,
    "isMultiSeason" BOOLEAN,
    "isPartialSeason" BOOLEAN,
    "isSeasonExtra" BOOLEAN,
    "isSpecial" BOOLEAN,
    "isTv" BOOLEAN,
    "languages" TEXT NOT NULL,
    "mode" REAL NOT NULL,
    "mtimeMs" REAL NOT NULL,
    "nlink" REAL NOT NULL,
    "path" TEXT NOT NULL,
    "revision" TEXT,
    "seasonPart" REAL,
    "sources" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uid" REAL NOT NULL,
    "libraryId" TEXT NOT NULL,
    "albumId" TEXT,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("path", "libraryId"),
    CONSTRAINT "File_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_File" ("airDate", "albumId", "atimeMs", "audioChannels", "audioCodec", "birthtimeMs", "chapters", "complete", "createdAt", "ctimeMs", "edition", "episodeFolder", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "multi", "name", "nlink", "path", "resolution", "revision", "seasonNumber", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "videoCodec", "year") SELECT "airDate", "albumId", "atimeMs", "audioChannels", "audioCodec", "birthtimeMs", "chapters", "complete", "createdAt", "ctimeMs", "edition", "episodeFolder", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "multi", "name", "nlink", "path", "resolution", "revision", "seasonNumber", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "videoCodec", "year" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
CREATE TABLE "new_Metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "libraryId" TEXT,
    CONSTRAINT "Metadata_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Metadata" ("id", "libraryId", "title") SELECT "id", "libraryId", "title" FROM "Metadata";
DROP TABLE "Metadata";
ALTER TABLE "new_Metadata" RENAME TO "Metadata";
CREATE TABLE "new_ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deviceId" TEXT NOT NULL,
    "sub_id" TEXT NOT NULL,
    CONSTRAINT "ActivityLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("created_at", "deviceId", "id", "sub_id", "time", "type", "updated_at") SELECT "created_at", "deviceId", "id", "sub_id", "time", "type", "updated_at" FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
CREATE TABLE "new_GuestStar" (
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
    CONSTRAINT "GuestStar_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GuestStar" ("adult", "castId", "character", "creditId", "episodeId", "gender", "id", "knownForDepartment", "name", "order", "originalName", "personId", "popularity", "profileId", "profilePath") SELECT "adult", "castId", "character", "creditId", "episodeId", "gender", "id", "knownForDepartment", "name", "order", "originalName", "personId", "popularity", "profileId", "profilePath" FROM "GuestStar";
DROP TABLE "GuestStar";
ALTER TABLE "new_GuestStar" RENAME TO "GuestStar";
CREATE UNIQUE INDEX "GuestStar_creditId_key" ON "GuestStar"("creditId");
CREATE INDEX "GuestStar_episodeId_idx" ON "GuestStar"("episodeId");
CREATE TABLE "new_Creator" (
    "creditId" TEXT NOT NULL,
    "gender" INTEGER,
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profilePath" TEXT,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "personId" INTEGER NOT NULL,
    CONSTRAINT "Creator_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Creator" ("blurHash", "creditId", "gender", "id", "name", "personId", "profilePath") SELECT "blurHash", "creditId", "gender", "id", "name", "personId", "profilePath" FROM "Creator";
DROP TABLE "Creator";
ALTER TABLE "new_Creator" RENAME TO "Creator";
CREATE UNIQUE INDEX "Creator_creditId_key" ON "Creator"("creditId");
CREATE INDEX "Creator_id_idx" ON "Creator"("id");
CREATE TABLE "new_UserNotification" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "NotificationTypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserNotification" ("notificationId", "userId") SELECT "notificationId", "userId" FROM "UserNotification";
DROP TABLE "UserNotification";
ALTER TABLE "new_UserNotification" RENAME TO "UserNotification";
CREATE INDEX "UserNotification_userId_idx" ON "UserNotification"("userId");
CREATE UNIQUE INDEX "UserNotification_notificationId_userId_key" ON "UserNotification"("notificationId", "userId");
CREATE TABLE "new_Movie" (
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
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Movie_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Movie" ("adult", "backdrop", "blurHash", "budget", "createdAt", "duration", "folder", "homepage", "id", "imdbId", "libraryId", "originalLanguage", "originalTitle", "overview", "popularity", "poster", "releaseDate", "revenue", "runtime", "show", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "updatedAt", "video", "voteAverage", "voteCount") SELECT "adult", "backdrop", "blurHash", "budget", "createdAt", "duration", "folder", "homepage", "id", "imdbId", "libraryId", "originalLanguage", "originalTitle", "overview", "popularity", "poster", "releaseDate", "revenue", "runtime", "show", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "updatedAt", "video", "voteAverage", "voteCount" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE INDEX "Movie_id_idx" ON "Movie"("id");
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");
CREATE TABLE "new_LibraryUser" (
    "libraryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LibraryUser_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LibraryUser" ("libraryId", "userId") SELECT "libraryId", "userId" FROM "LibraryUser";
DROP TABLE "LibraryUser";
ALTER TABLE "new_LibraryUser" RENAME TO "LibraryUser";
CREATE INDEX "LibraryUser_userId_idx" ON "LibraryUser"("userId");
CREATE UNIQUE INDEX "LibraryUser_libraryId_userId_key" ON "LibraryUser"("libraryId", "userId");
CREATE TABLE "new_EncoderProfileLibrary" (
    "libraryId" TEXT NOT NULL,
    "encoderProfileId" TEXT NOT NULL,

    PRIMARY KEY ("libraryId", "encoderProfileId"),
    CONSTRAINT "EncoderProfileLibrary_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EncoderProfileLibrary_encoderProfileId_fkey" FOREIGN KEY ("encoderProfileId") REFERENCES "EncoderProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EncoderProfileLibrary" ("encoderProfileId", "libraryId") SELECT "encoderProfileId", "libraryId" FROM "EncoderProfileLibrary";
DROP TABLE "EncoderProfileLibrary";
ALTER TABLE "new_EncoderProfileLibrary" RENAME TO "EncoderProfileLibrary";
CREATE INDEX "EncoderProfileLibrary_encoderProfileId_idx" ON "EncoderProfileLibrary"("encoderProfileId");
CREATE UNIQUE INDEX "EncoderProfileLibrary_libraryId_encoderProfileId_key" ON "EncoderProfileLibrary"("libraryId", "encoderProfileId");
CREATE TABLE "new_MediaAttachments" (
    "ItemId" TEXT NOT NULL PRIMARY KEY,
    "Type" INTEGER NOT NULL,
    "Value" TEXT NOT NULL,
    "CleanValue" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaAttachments_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MediaAttachments" ("CleanValue", "ItemId", "Type", "Value", "createdAt", "fileId", "updatedAt") SELECT "CleanValue", "ItemId", "Type", "Value", "createdAt", "fileId", "updatedAt" FROM "MediaAttachments";
DROP TABLE "MediaAttachments";
ALTER TABLE "new_MediaAttachments" RENAME TO "MediaAttachments";
CREATE INDEX "MediaAttachments_ItemId_Type_CleanValue_idx" ON "MediaAttachments"("ItemId", "Type", "CleanValue");
CREATE INDEX "MediaAttachments_Type_CleanValue_ItemId_idx" ON "MediaAttachments"("Type", "CleanValue", "ItemId");
CREATE INDEX "MediaAttachments_Type_ItemId_Value_idx" ON "MediaAttachments"("Type", "ItemId", "Value");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
