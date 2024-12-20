/*
  Warnings:

  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - Made the column `stripe_customer_id` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropIndex
DROP INDEX "subscriptions_userId_idx";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "userId",
ALTER COLUMN "stripe_customer_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_stripe_customer_id_fkey" FOREIGN KEY ("stripe_customer_id") REFERENCES "stripe_customers"("stripe_customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
