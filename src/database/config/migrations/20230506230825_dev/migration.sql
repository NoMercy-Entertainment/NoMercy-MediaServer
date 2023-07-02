/*
  Warnings:

  - The primary key for the `Special` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecialItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "specialId" TEXT,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    CONSTRAINT "SpecialItem_specialId_fkey" FOREIGN KEY ("specialId") REFERENCES "Special" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpecialItem" ("episodeId", "id", "movieId", "order", "specialId", "type") SELECT "episodeId", "id", "movieId", "order", "specialId", "type" FROM "SpecialItem";
DROP TABLE "SpecialItem";
ALTER TABLE "new_SpecialItem" RENAME TO "SpecialItem";
CREATE UNIQUE INDEX "SpecialItem_episodeId_key" ON "SpecialItem"("episodeId");
CREATE UNIQUE INDEX "SpecialItem_movieId_key" ON "SpecialItem"("movieId");
CREATE TABLE "new_Special" (
    "backdrop" TEXT,
    "description" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "blurHash" TEXT,
    "colorPalette" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Special_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Special" ("backdrop", "blurHash", "colorPalette", "createdAt", "description", "id", "libraryId", "poster", "title", "updatedAt") SELECT "backdrop", "blurHash", "colorPalette", "createdAt", "description", "id", "libraryId", "poster", "title", "updatedAt" FROM "Special";
DROP TABLE "Special";
ALTER TABLE "new_Special" RENAME TO "Special";
CREATE UNIQUE INDEX "Special_title_key" ON "Special"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
