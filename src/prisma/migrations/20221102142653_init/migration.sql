/*
  Warnings:

  - You are about to drop the column `artistId` on the `Artist` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "folder" TEXT,
    "colorPalette" TEXT,
    "libraryId" TEXT NOT NULL,
    "trackId" TEXT,
    CONSTRAINT "Artist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("colorPalette", "cover", "description", "folder", "id", "libraryId", "name", "trackId") SELECT "colorPalette", "cover", "description", "folder", "id", "libraryId", "name", "trackId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE INDEX "artist_id_index" ON "Artist"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
