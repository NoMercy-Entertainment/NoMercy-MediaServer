/*
  Warnings:

  - You are about to drop the `FailedJobs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FailedJobs";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cast" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageId" TEXT,
    "personId" INTEGER NOT NULL,
    "movieId" INTEGER,
    "tvId" INTEGER,
    "seasonId" INTEGER,
    "episodeId" INTEGER,
    CONSTRAINT "Cast_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cast_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cast_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cast_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cast_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cast_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cast" ("episodeId", "id", "movieId", "personId", "seasonId", "tvId") SELECT "episodeId", "id", "movieId", "personId", "seasonId", "tvId" FROM "Cast";
DROP TABLE "Cast";
ALTER TABLE "new_Cast" RENAME TO "Cast";
CREATE UNIQUE INDEX "Cast_personId_movieId_key" ON "Cast"("personId", "movieId");
CREATE UNIQUE INDEX "Cast_personId_tvId_key" ON "Cast"("personId", "tvId");
CREATE UNIQUE INDEX "Cast_personId_seasonId_key" ON "Cast"("personId", "seasonId");
CREATE UNIQUE INDEX "Cast_personId_episodeId_key" ON "Cast"("personId", "episodeId");
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
    "blurHash" TEXT,
    "movieId" INTEGER,
    "tvId" INTEGER,
    CONSTRAINT "Image_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Image_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width") SELECT "aspectRatio", "blurHash", "colorPalette", "createdAt", "filePath", "height", "id", "iso6391", "movieId", "name", "site", "size", "tvId", "type", "updatedAt", "voteAverage", "voteCount", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_site_type_filePath_width_height_key" ON "Image"("site", "type", "filePath", "width", "height");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
