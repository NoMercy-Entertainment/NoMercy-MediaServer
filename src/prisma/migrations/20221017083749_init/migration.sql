/*
  Warnings:

  - A unique constraint covering the columns `[albumId]` on the table `Album` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Album_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Album_albumId_key" ON "Album"("albumId");
