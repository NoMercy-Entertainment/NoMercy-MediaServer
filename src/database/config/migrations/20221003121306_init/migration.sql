-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "folder" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "ep_folder" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "year" INTEGER,
    "size" REAL NOT NULL,
    "id" TEXT NOT NULL,
    "airDate" TEXT,
    "atimeMs" REAL NOT NULL,
    "birthtimeMs" REAL NOT NULL,
    "ctimeMs" REAL NOT NULL,
    "edition" TEXT,
    "ffprobe" TEXT,
    "fullSeason" BOOLEAN NOT NULL,
    "gid" REAL NOT NULL,
    "group" TEXT,
    "isMultiSeason" BOOLEAN NOT NULL,
    "isPartialSeason" BOOLEAN NOT NULL,
    "isSeasonExtra" BOOLEAN NOT NULL,
    "isSpecial" BOOLEAN NOT NULL,
    "isTv" BOOLEAN NOT NULL,
    "languages" TEXT NOT NULL,
    "mode" REAL NOT NULL,
    "mtimeMs" REAL NOT NULL,
    "nlink" REAL NOT NULL,
    "path" TEXT NOT NULL,
    "revision" TEXT,
    "seasonPart" REAL NOT NULL,
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
INSERT INTO "new_File" ("airDate", "atimeMs", "birthtimeMs", "createdAt", "ctimeMs", "edition", "ep_folder", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "name", "nlink", "path", "revision", "season", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "year") SELECT "airDate", "atimeMs", "birthtimeMs", "createdAt", "ctimeMs", "edition", "ep_folder", "episodeId", "episodeNumber", "extension", "ffprobe", "folder", "fullSeason", "gid", "group", "id", "isMultiSeason", "isPartialSeason", "isSeasonExtra", "isSpecial", "isTv", "languages", "libraryId", "mode", "movieId", "mtimeMs", "name", "nlink", "path", "revision", "season", "seasonPart", "size", "sources", "title", "type", "uid", "updatedAt", "year" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
