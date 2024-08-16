/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `accessPeriods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accessPeriods_userId_key" ON "accessPeriods"("userId");
