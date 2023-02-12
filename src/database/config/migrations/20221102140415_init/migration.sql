/*
  Warnings:

  - You are about to drop the column `albumId` on the `Album` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Album_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("colorPalette", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year") SELECT "colorPalette", "country", "cover", "description", "folder", "id", "libraryId", "name", "tracks", "year" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE INDEX "album_track_id_index" ON "Album"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
