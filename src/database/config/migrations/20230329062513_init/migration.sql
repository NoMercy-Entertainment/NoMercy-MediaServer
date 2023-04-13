/*
  Warnings:

  - You are about to drop the column `profilePath` on the `Person` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "alsoKnownAs" TEXT,
    "biography" TEXT,
    "birthday" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "deathday" TEXT,
    "gender" INTEGER NOT NULL DEFAULT 0,
    "homepage" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imdbId" TEXT,
    "knownForDepartment" TEXT,
    "name" TEXT,
    "placeOfBirth" TEXT,
    "popularity" REAL,
    "profile" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "blurHash" TEXT,
    "colorPalette" TEXT
);
INSERT INTO "new_Person" ("adult", "alsoKnownAs", "biography", "birthday", "blurHash", "colorPalette", "createdAt", "deathday", "gender", "homepage", "id", "imdbId", "knownForDepartment", "name", "placeOfBirth", "popularity", "updatedAt") SELECT "adult", "alsoKnownAs", "biography", "birthday", "blurHash", "colorPalette", "createdAt", "deathday", "gender", "homepage", "id", "imdbId", "knownForDepartment", "name", "placeOfBirth", "popularity", "updatedAt" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE UNIQUE INDEX "Person_profile_key" ON "Person"("profile");
CREATE INDEX "Person_id_idx" ON "Person"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
