/*
  Warnings:

  - You are about to drop the column `title` on the `Device` table. All the data in the column will be lost.
  - Added the required column `browser` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_Device" ("created_at", "deviceId", "id", "ip", "os", "type", "updated_at", "version") SELECT "created_at", "deviceId", "id", "ip", "os", "type", "updated_at", "version" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
