/*
  Warnings:

  - The primary key for the `Job` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creditId" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "episodeCount" INTEGER,
    "crewId" INTEGER,
    CONSTRAINT "Job_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("creditId", "crewId", "episodeCount", "job") SELECT "creditId", "crewId", "episodeCount", "job" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_creditId_idx" ON "Job"("creditId");
CREATE UNIQUE INDEX "Job_crewId_creditId_key" ON "Job"("crewId", "creditId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
