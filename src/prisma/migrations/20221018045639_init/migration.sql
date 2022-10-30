/*
  Warnings:

  - You are about to drop the column `share` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `share` on the `Artist` table. All the data in the column will be lost.
  - Added the required column `libraryId` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `libraryId` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "albumId" TEXT NOT NULL,
    "folder" TEXT,
    "cover" TEXT,
    "year" INTEGER,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Album_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Album" ("albumId", "cover", "description", "id", "name", "year") SELECT "albumId", "cover", "description", "id", "name", "year" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
CREATE INDEX "album_track_id_index" ON "Album"("id");
CREATE UNIQUE INDEX "Album_albumId_key" ON "Album"("albumId");
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artistId" TEXT,
    "cover" TEXT,
    "folder" TEXT,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Artist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("artistId", "cover", "description", "folder", "id", "name") SELECT "artistId", "cover", "description", "folder", "id", "name" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE INDEX "artist_id_index" ON "Artist"("id");
CREATE UNIQUE INDEX "Artist_artistId_key" ON "Artist"("artistId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
