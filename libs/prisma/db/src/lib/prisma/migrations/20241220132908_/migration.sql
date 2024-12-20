/*
  Warnings:

  - You are about to drop the column `authUserId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_price_id]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - Made the column `stripe_price_id` on table `plans` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `priceId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropIndex
DROP INDEX "subscriptions_planId_idx";

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "stripe_price_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "authUserId",
DROP COLUMN "planId",
ADD COLUMN     "priceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_id_key" ON "plans"("stripe_price_id");

-- CreateIndex
CREATE INDEX "plans_stripe_price_id_idx" ON "plans"("stripe_price_id");

-- CreateIndex
CREATE INDEX "subscriptions_priceId_idx" ON "subscriptions"("priceId");
