/*
  Warnings:

  - You are about to alter the column `disc` on the `Track` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `track` on the `Track` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" INTEGER,
    "disc" INTEGER,
    "cover" TEXT,
    "date" DATETIME NOT NULL,
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" TEXT,
    "quality" INTEGER,
    "path" TEXT NOT NULL,
    "lyrics" TEXT
);
INSERT INTO "new_Track" ("cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track") SELECT "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_filename_path_key" ON "Track"("filename", "path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
