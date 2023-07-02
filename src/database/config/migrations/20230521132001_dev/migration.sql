/*
  Warnings:

  - Added the required column `os` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_Device" ("created_at", "deviceId", "id", "ip", "title", "type", "updated_at", "version") SELECT "created_at", "deviceId", "id", "ip", "title", "type", "updated_at", "version" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
