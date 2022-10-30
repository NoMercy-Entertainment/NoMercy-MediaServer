/*
  Warnings:

  - You are about to drop the column `Chapters` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `codec` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `crc` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `ep_ab_num` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `ep_num` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `extra_info` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `regex` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `release_group` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `season_num` on the `File` table. All the data in the column will be lost.
  - You are about to alter the column `gid` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Float`.
  - You are about to alter the column `mode` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Float`.
  - You are about to alter the column `nlink` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Float`.
  - You are about to alter the column `size` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Float`.
  - You are about to alter the column `uid` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Float`.
  - You are about to alter the column `year` on the `File` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Added the required column `episodeNumber` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullSeason` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isMultiSeason` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPartialSeason` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSeasonExtra` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isSpecial` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isTv` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languages` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `season` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seasonPart` to the `File` table without a default value. This is not possible if the table is not empty.
  - Made the column `ep_folder` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ffprobe` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
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
    "ffprobe" TEXT NOT NULL,
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
INSERT INTO "new_File" ("atimeMs", "birthtimeMs", "createdAt", "ctimeMs", "ep_folder", "episodeId", "extension", "ffprobe", "folder", "gid", "id", "libraryId", "mode", "movieId", "mtimeMs", "name", "nlink", "path", "size", "title", "type", "uid", "updatedAt", "year") SELECT "atimeMs", "birthtimeMs", "createdAt", "ctimeMs", "ep_folder", "episodeId", "extension", "ffprobe", "folder", "gid", "id", "libraryId", "mode", "movieId", "mtimeMs", "name", "nlink", "path", "size", "title", "type", "uid", "updatedAt", "year" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_id_key" ON "File"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
