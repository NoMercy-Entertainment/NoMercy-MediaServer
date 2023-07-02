-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "device" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "custom_name" TEXT,
    "version" TEXT NOT NULL,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_Device" ("browser", "created_at", "device", "deviceId", "id", "ip", "name", "os", "type", "updated_at", "version") SELECT "browser", "created_at", "device", "deviceId", "id", "ip", "name", "os", "type", "updated_at", "version" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
