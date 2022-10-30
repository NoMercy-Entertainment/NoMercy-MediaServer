/*
  Warnings:

  - Added the required column `taskId` to the `QueueJob` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QueueJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "queue" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "runAt" DATETIME,
    "payload" TEXT,
    "result" TEXT,
    "error" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "key" TEXT,
    "cron" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER,
    "notBefore" DATETIME,
    "finishedAt" DATETIME,
    "processedAt" DATETIME,
    "failedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_QueueJob" ("attempts", "createdAt", "cron", "error", "failedAt", "finishedAt", "id", "key", "maxAttempts", "notBefore", "payload", "priority", "processedAt", "progress", "queue", "result", "runAt", "updatedAt") SELECT "attempts", "createdAt", "cron", "error", "failedAt", "finishedAt", "id", "key", "maxAttempts", "notBefore", "payload", "priority", "processedAt", "progress", "queue", "result", "runAt", "updatedAt" FROM "QueueJob";
DROP TABLE "QueueJob";
ALTER TABLE "new_QueueJob" RENAME TO "QueueJob";
CREATE INDEX "QueueJob_queue_priority_runAt_finishedAt_idx" ON "QueueJob"("queue", "priority", "runAt", "finishedAt");
CREATE UNIQUE INDEX "QueueJob_key_runAt_key" ON "QueueJob"("key", "runAt");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
