/*
  Warnings:

  - You are about to drop the column `movieId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `tvId` on the `Image` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aspectRatio" REAL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "height" INTEGER,
    "iso6391" TEXT,
    "name" TEXT,
    "site" TEXT,
    "size" INTEGER,
    "filePath" TEXT NOT NULL,
    "type" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "width" INTEGER,
    "voteAverage" REAL,
    "voteCount" INTEGER,
    "colorPalette" TEXT,
    "blurHash" TEXT
);
INSERT INTO "new_Image" ("aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "name", "site", "size", "type", "updatedAt", "voteAverage", "voteCount", "width") SELECT "aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "name", "site", "size", "type", "updatedAt", "voteAverage", "voteCount", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_site_type_filePath_width_height_key" ON "Image"("site", "type", "filePath", "width", "height");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
