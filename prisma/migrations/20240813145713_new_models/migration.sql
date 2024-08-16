/*
  Warnings:

  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cancelAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `cancelAtPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodStart` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `providerSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeSubId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `interval` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSubId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_userId_fkey";

-- DropForeignKey
ALTER TABLE "prices" DROP CONSTRAINT "prices_productId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_priceId_fkey";

-- DropIndex
DROP INDEX "subscriptions_userId_key";

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
DROP COLUMN "cancelAt",
DROP COLUMN "cancelAtPeriodEnd",
DROP COLUMN "canceledAt",
DROP COLUMN "currentPeriodEnd",
DROP COLUMN "currentPeriodStart",
DROP COLUMN "endedAt",
DROP COLUMN "planType",
DROP COLUMN "priceId",
DROP COLUMN "providerSubscriptionId",
DROP COLUMN "quantity",
DROP COLUMN "subscriptionId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "interval" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stripeSubId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
DROP COLUMN "subscriptionId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "customers";

-- DropTable
DROP TABLE "prices";

-- DropTable
DROP TABLE "products";

-- DropEnum
DROP TYPE "PlanType";

-- DropEnum
DROP TYPE "PricingPlanInterval";

-- DropEnum
DROP TYPE "PricingType";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessPeriods" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessPeriods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "payments"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubId_key" ON "subscriptions"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessPeriods" ADD CONSTRAINT "accessPeriods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
