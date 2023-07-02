/*
  Warnings:

  - You are about to drop the column `libraryId` on the `Special` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Special" (
    "backdrop" TEXT,
    "description" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY,
    "poster" TEXT,
    "title" TEXT NOT NULL,
    "blurHash" TEXT,
    "colorPalette" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Special" ("backdrop", "blurHash", "colorPalette", "createdAt", "description", "id", "poster", "title", "updatedAt") SELECT "backdrop", "blurHash", "colorPalette", "createdAt", "description", "id", "poster", "title", "updatedAt" FROM "Special";
DROP TABLE "Special";
ALTER TABLE "new_Special" RENAME TO "Special";
CREATE UNIQUE INDEX "Special_title_key" ON "Special"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
