/*
  Warnings:

  - You are about to drop the column `host_folder` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `share` on the `Track` table. All the data in the column will be lost.
  - Added the required column `path` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" TEXT,
    "disc" TEXT,
    "cover" TEXT,
    "date" DATETIME NOT NULL,
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" TEXT,
    "quality" INTEGER,
    "path" TEXT NOT NULL,
    "lyrics" TEXT
);
INSERT INTO "new_Track" ("cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "quality", "track") SELECT "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "quality", "track" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_filename_path_key" ON "Track"("filename", "path");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
