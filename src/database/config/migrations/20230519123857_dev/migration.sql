-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserData" (
    "id" TEXT NOT NULL,
    "rating" REAL,
    "played" BOOLEAN,
    "playCount" INTEGER,
    "isFavorite" BOOLEAN,
    "playbackPositionTicks" BIGINT,
    "lastPlayedDate" DATETIME,
    "audio" TEXT,
    "subtitle" TEXT,
    "subtitleType" TEXT,
    "time" INTEGER,
    "type" TEXT,
    "sub_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "movieId" INTEGER,
    "tvId" INTEGER,
    "specialId" TEXT,
    "videoFileId" INTEGER,
    CONSTRAINT "UserData_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_tvId_fkey" FOREIGN KEY ("tvId") REFERENCES "Tv" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_specialId_fkey" FOREIGN KEY ("specialId") REFERENCES "Special" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserData_videoFileId_fkey" FOREIGN KEY ("videoFileId") REFERENCES "VideoFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserData" ("audio", "createdAt", "id", "isFavorite", "lastPlayedDate", "movieId", "playCount", "playbackPositionTicks", "played", "rating", "sub_id", "subtitle", "subtitleType", "time", "tvId", "type", "updatedAt", "videoFileId") SELECT "audio", "createdAt", "id", "isFavorite", "lastPlayedDate", "movieId", "playCount", "playbackPositionTicks", "played", "rating", "sub_id", "subtitle", "subtitleType", "time", "tvId", "type", "updatedAt", "videoFileId" FROM "UserData";
DROP TABLE "UserData";
ALTER TABLE "new_UserData" RENAME TO "UserData";
CREATE UNIQUE INDEX "UserData_id_key" ON "UserData"("id");
CREATE INDEX "UserData_tvId_movieId_videoFileId_sub_id_idx" ON "UserData"("tvId", "movieId", "videoFileId", "sub_id");
CREATE UNIQUE INDEX "UserData_tvId_videoFileId_sub_id_key" ON "UserData"("tvId", "videoFileId", "sub_id");
CREATE UNIQUE INDEX "UserData_movieId_videoFileId_sub_id_key" ON "UserData"("movieId", "videoFileId", "sub_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
