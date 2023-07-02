/*
  Warnings:

  - You are about to drop the column `os` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    "deviceId" TEXT NOT NULL,
    "sub_id" TEXT NOT NULL,
    CONSTRAINT "ActivityLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "User" ("sub_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("created_at", "deviceId", "id", "sub_id", "time", "type", "updated_at") SELECT "created_at", "deviceId", "id", "sub_id", "time", "type", "updated_at" FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
