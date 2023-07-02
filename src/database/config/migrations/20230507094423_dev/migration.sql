/*
  Warnings:

  - You are about to drop the column `type` on the `SpecialItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecialItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "specialId" TEXT,
    "episodeId" INTEGER,
    "movieId" INTEGER,
    CONSTRAINT "SpecialItem_specialId_fkey" FOREIGN KEY ("specialId") REFERENCES "Special" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpecialItem_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpecialItem" ("episodeId", "id", "movieId", "order", "specialId") SELECT "episodeId", "id", "movieId", "order", "specialId" FROM "SpecialItem";
DROP TABLE "SpecialItem";
ALTER TABLE "new_SpecialItem" RENAME TO "SpecialItem";
CREATE UNIQUE INDEX "SpecialItem_episodeId_key" ON "SpecialItem"("episodeId");
CREATE UNIQUE INDEX "SpecialItem_movieId_key" ON "SpecialItem"("movieId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
