/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `stripe_customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "enabled" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_userId_key" ON "stripe_customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");
