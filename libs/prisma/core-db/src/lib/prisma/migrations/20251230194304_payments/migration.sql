/*
  Warnings:

  - You are about to drop the column `cancelAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `canceledAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodStart` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `trialEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `trialStart` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `current_period_end` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_period_start` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "cancelAt",
DROP COLUMN "canceledAt",
DROP COLUMN "currentPeriodEnd",
DROP COLUMN "currentPeriodStart",
DROP COLUMN "trialEnd",
DROP COLUMN "trialStart",
ADD COLUMN     "cancel_at" TIMESTAMP(3),
ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "current_period_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "current_period_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trial_end" TIMESTAMP(3),
ADD COLUMN     "trial_start" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "prices_active_idx" ON "prices"("active");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_status_current_period_end_idx" ON "subscriptions"("status", "current_period_end");

-- AddForeignKey
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
