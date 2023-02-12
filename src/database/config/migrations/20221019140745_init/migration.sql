-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artistId" TEXT,
    "cover" TEXT,
    "folder" TEXT,
    "libraryId" TEXT NOT NULL,
    "trackId" TEXT,
    CONSTRAINT "Artist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("artistId", "cover", "description", "folder", "id", "libraryId", "name") SELECT "artistId", "cover", "description", "folder", "id", "libraryId", "name" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE INDEX "artist_id_index" ON "Artist"("id");
CREATE UNIQUE INDEX "Artist_artistId_key" ON "Artist"("artistId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
