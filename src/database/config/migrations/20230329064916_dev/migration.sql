/*
  Warnings:

  - A unique constraint covering the columns `[profile]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Person_profile_key" ON "Person"("profile");
