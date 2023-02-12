-- AlterTable
ALTER TABLE "Cast" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- AlterTable
ALTER TABLE "Crew" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- AlterTable
ALTER TABLE "Library" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- AlterTable
ALTER TABLE "Person" ADD COLUMN "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB';

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "folder" TEXT,
    "colorPalette" TEXT,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "libraryId" TEXT NOT NULL,
    "trackId" TEXT,
    CONSTRAINT "Artist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("blurHash", "colorPalette", "cover", "description", "folder", "id", "libraryId", "name", "trackId") SELECT "blurHash", "colorPalette", "cover", "description", "folder", "id", "libraryId", "name", "trackId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE INDEX "artist_id_index" ON "Artist"("id");
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
    CONSTRAINT "Movie_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Movie" ("adult", "backdrop", "blurHash", "budget", "createdAt", "duration", "folder", "homepage", "id", "imdbId", "libraryId", "originalLanguage", "originalTitle", "overview", "popularity", "poster", "releaseDate", "revenue", "runtime", "show", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "updatedAt", "video", "voteAverage", "voteCount") SELECT "adult", "backdrop", "blurHash", "budget", "createdAt", "duration", "folder", "homepage", "id", "imdbId", "libraryId", "originalLanguage", "originalTitle", "overview", "popularity", "poster", "releaseDate", "revenue", "runtime", "show", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "updatedAt", "video", "voteAverage", "voteCount" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE INDEX "Movie_id_idx" ON "Movie"("id");
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");
CREATE TABLE "new_Similar" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "mediaId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "similarableId" INTEGER NOT NULL,
    "similarableType" TEXT NOT NULL
);
INSERT INTO "new_Similar" ("backdrop", "blurHash", "id", "mediaId", "mediaType", "overview", "poster", "similarableId", "similarableType", "title", "titleSort") SELECT "backdrop", "blurHash", "id", "mediaId", "mediaType", "overview", "poster", "similarableId", "similarableType", "title", "titleSort" FROM "Similar";
DROP TABLE "Similar";
ALTER TABLE "new_Similar" RENAME TO "Similar";
CREATE INDEX "Similar_similarableId_similarableType_idx" ON "Similar"("similarableId", "similarableType");
CREATE UNIQUE INDEX "Similar_similarableId_similarableType_mediaId_key" ON "Similar"("similarableId", "similarableType", "mediaId");
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" INTEGER,
    "disc" INTEGER,
    "cover" TEXT,
    "date" DATETIME,
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" TEXT,
    "quality" INTEGER,
    "path" TEXT NOT NULL,
    "lyrics" TEXT,
    "colorPalette" TEXT,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB'
);
INSERT INTO "new_Track" ("blurHash", "colorPalette", "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track") SELECT "blurHash", "colorPalette", "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE TABLE "new_Tv" (
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
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Tv_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tv" ("backdrop", "blurHash", "createdAt", "duration", "firstAirDate", "folder", "haveEpisodes", "homepage", "id", "imdbId", "inProduction", "lastAirDate", "lastEpisodeToAir", "libraryId", "mediaType", "nextEpisodeToAir", "numberOfEpisodes", "numberOfSeasons", "originCountry", "originalLanguage", "overview", "popularity", "poster", "spokenLanguages", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "type", "updatedAt", "voteAverage", "voteCount") SELECT "backdrop", "blurHash", "createdAt", "duration", "firstAirDate", "folder", "haveEpisodes", "homepage", "id", "imdbId", "inProduction", "lastAirDate", "lastEpisodeToAir", "libraryId", "mediaType", "nextEpisodeToAir", "numberOfEpisodes", "numberOfSeasons", "originCountry", "originalLanguage", "overview", "popularity", "poster", "spokenLanguages", "status", "tagline", "title", "titleSort", "trailer", "tvdbId", "type", "updatedAt", "voteAverage", "voteCount" FROM "Tv";
DROP TABLE "Tv";
ALTER TABLE "new_Tv" RENAME TO "Tv";
CREATE UNIQUE INDEX "Tv_id_key" ON "Tv"("id");
CREATE INDEX "Tv_id_idx" ON "Tv"("id");
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "colorPalette" TEXT,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Playlist" ("blurHash", "colorPalette", "cover", "created_at", "description", "id", "name", "updated_at", "userId") SELECT "blurHash", "colorPalette", "cover", "created_at", "description", "id", "name", "updated_at", "userId" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_id_userId_key" ON "Playlist"("id", "userId");
CREATE TABLE "new_Recommendation" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "recommendationableId" INTEGER NOT NULL,
    "recommendationableType" TEXT NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL
);
INSERT INTO "new_Recommendation" ("backdrop", "blurHash", "id", "mediaId", "mediaType", "overview", "poster", "recommendationableId", "recommendationableType", "title", "titleSort") SELECT "backdrop", "blurHash", "id", "mediaId", "mediaType", "overview", "poster", "recommendationableId", "recommendationableType", "title", "titleSort" FROM "Recommendation";
DROP TABLE "Recommendation";
ALTER TABLE "new_Recommendation" RENAME TO "Recommendation";
CREATE INDEX "Recommendation_recommendationableId_recommendationableType_idx" ON "Recommendation"("recommendationableId", "recommendationableType");
CREATE UNIQUE INDEX "Recommendation_recommendationableId_recommendationableType_mediaId_mediaType_key" ON "Recommendation"("recommendationableId", "recommendationableType", "mediaId", "mediaType");
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
    CONSTRAINT "Image_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Image_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width") SELECT "aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_filePath_key" ON "Image"("filePath");
CREATE UNIQUE INDEX "Image_site_type_filePath_width_height_key" ON "Image"("site", "type", "filePath", "width", "height");
CREATE TABLE "new_Media" (
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
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
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
INSERT INTO "new_Media" ("aspectRatio", "blurHash", "colorPalette", "createdAt", "episodeId", "height", "id", "iso6391", "movieId", "name", "personId", "seasonId", "site", "size", "src", "tvId", "type", "updatedAt", "videoFileId", "voteAverage", "voteCount", "width") SELECT "aspectRatio", "blurHash", "colorPalette", "createdAt", "episodeId", "height", "id", "iso6391", "movieId", "name", "personId", "seasonId", "site", "size", "src", "tvId", "type", "updatedAt", "videoFileId", "voteAverage", "voteCount", "width" FROM "Media";
DROP TABLE "Media";
ALTER TABLE "new_Media" RENAME TO "Media";
CREATE UNIQUE INDEX "Media_src_key" ON "Media"("src");
CREATE TABLE "new_Collection" (
    "backdrop" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "parts" INTEGER,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "titleSort" TEXT NOT NULL,
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Collection_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("backdrop", "blurHash", "id", "libraryId", "overview", "parts", "poster", "title", "titleSort") SELECT "backdrop", "blurHash", "id", "libraryId", "overview", "parts", "poster", "title", "titleSort" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE INDEX "Collection_id_idx" ON "Collection"("id");
CREATE TABLE "new_Special" (
    "backdrop" TEXT,
    "description" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "blurHash" TEXT DEFAULT '{ "poster": "S1423toNIVof00R$_1WB", "backdrop": "S1423toNIVof00R$_1WB" }',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Special_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Special" ("backdrop", "blurHash", "createdAt", "description", "id", "libraryId", "poster", "title", "updatedAt") SELECT "backdrop", "blurHash", "createdAt", "description", "id", "libraryId", "poster", "title", "updatedAt" FROM "Special";
DROP TABLE "Special";
ALTER TABLE "new_Special" RENAME TO "Special";
CREATE UNIQUE INDEX "Special_title_key" ON "Special"("title");
CREATE TABLE "new_Season" (
    "airDate" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "episodeCount" INTEGER,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overview" TEXT,
    "poster" TEXT,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "tvId" INTEGER NOT NULL,
    CONSTRAINT "Season_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Season" ("airDate", "blurHash", "createdAt", "episodeCount", "id", "overview", "poster", "seasonNumber", "title", "tvId", "updatedAt") SELECT "airDate", "blurHash", "createdAt", "episodeCount", "id", "overview", "poster", "seasonNumber", "title", "tvId", "updatedAt" FROM "Season";
DROP TABLE "Season";
ALTER TABLE "new_Season" RENAME TO "Season";
CREATE UNIQUE INDEX "Season_id_key" ON "Season"("id");
CREATE INDEX "Season_tvId_idx" ON "Season"("tvId");
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "folder" TEXT,
    "cover" TEXT,
    "country" TEXT,
    "year" INTEGER,
    "tracks" INTEGER,
    "colorPalette" TEXT,
    "blurHash" TEXT DEFAULT 'S1423toNIVof00R$_1WB',
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Album_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("blurHash", "colorPalette", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year") SELECT "blurHash", "colorPalette", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE INDEX "album_track_id_index" ON "Album"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
