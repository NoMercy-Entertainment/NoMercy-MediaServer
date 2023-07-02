-- CreateTable
CREATE TABLE "FailedJobs" (
    "connnection" TEXT,
    "exception" TEXT NOT NULL,
    "failedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "uuid" TEXT NOT NULL PRIMARY KEY
);
