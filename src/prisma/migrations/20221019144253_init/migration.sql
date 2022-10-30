/*
  Warnings:

  - Made the column `name` on table `Album` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "albumId" TEXT NOT NULL,
    "folder" TEXT,
    "cover" TEXT,
    "country" TEXT,
    "year" INTEGER,
    "tracks" INTEGER,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Album_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("albumId", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year") SELECT "albumId", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE INDEX "album_track_id_index" ON "Album"("id");
CREATE UNIQUE INDEX "Album_albumId_key" ON "Album"("albumId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
