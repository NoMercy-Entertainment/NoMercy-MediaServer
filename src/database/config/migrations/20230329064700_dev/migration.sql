/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Configuration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Configuration_key_key" ON "Configuration"("key");