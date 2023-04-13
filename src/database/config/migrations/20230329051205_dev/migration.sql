/*
  Warnings:

  - A unique constraint covering the columns `[castId,creditId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[castId,guestId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Role_castId_creditId_guestId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Role_castId_creditId_key" ON "Role"("castId", "creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_castId_guestId_key" ON "Role"("castId", "guestId");
