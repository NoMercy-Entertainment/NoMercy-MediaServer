-- CreateTable
CREATE TABLE "QueueJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "queue" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "QueueJob_queue_priority_runAt_finishedAt_idx" ON "QueueJob"("queue", "priority", "runAt", "finishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QueueJob_key_runAt_key" ON "QueueJob"("key", "runAt");
