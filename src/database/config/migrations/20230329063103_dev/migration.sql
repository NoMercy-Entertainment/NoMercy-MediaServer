/*
  Warnings:

  - A unique constraint covering the columns `[still]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Episode_still_key" ON "Episode"("still");
