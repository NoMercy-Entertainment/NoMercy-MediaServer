/*
  Warnings:

  - Made the column `albumId` on table `Album` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "albumId" TEXT NOT NULL,
    "cover" TEXT,
    "year" INTEGER,
    "share" TEXT NOT NULL DEFAULT 'Media'
);
INSERT INTO "new_Album" ("albumId", "cover", "description", "id", "name", "share", "year") SELECT "albumId", "cover", "description", "id", "name", "share", "year" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE INDEX "album_track_id_index" ON "Album"("id");
CREATE UNIQUE INDEX "Album_albumId_key" ON "Album"("albumId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
