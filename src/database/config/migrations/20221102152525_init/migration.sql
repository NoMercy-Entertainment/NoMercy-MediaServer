-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "track" INTEGER,
    "disc" INTEGER,
    "cover" TEXT,
    "date" DATETIME,
    "folder" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" TEXT,
    "quality" INTEGER,
    "path" TEXT NOT NULL,
    "lyrics" TEXT,
    "colorPalette" TEXT
);
INSERT INTO "new_Track" ("colorPalette", "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track") SELECT "colorPalette", "cover", "date", "disc", "duration", "filename", "folder", "id", "lyrics", "name", "path", "quality", "track" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
