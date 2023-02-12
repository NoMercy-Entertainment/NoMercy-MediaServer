/*
  Warnings:

  - You are about to drop the column `ep_folder` on the `File` table. All the data in the column will be lost.
  - Added the required column `episodeFolder` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "episodeId" INTEGER,
    "movieId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("path", "libraryId"),
    CONSTRAINT "File_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "File_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_File" ("airDate", "atimeMs", "audioChannels", "audioCodec", "birthtimeMs", "chapters", "complete", "createdAt", "ctimeMs", "edition", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "multi", "name", "nlink", "path", "resolution", "revision", "seasonNumber", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "videoCodec", "year") SELECT "airDate", "atimeMs", "audioChannels", "audioCodec", "birthtimeMs", "chapters", "complete", "createdAt", "ctimeMs", "edition", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "multi", "name", "nlink", "path", "resolution", "revision", "seasonNumber", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "videoCodec", "year" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
