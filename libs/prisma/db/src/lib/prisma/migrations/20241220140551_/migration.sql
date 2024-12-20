/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `payment_customer_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_stripe_customer_id_fkey";

-- DropIndex
DROP INDEX "subscriptions_stripe_customer_id_idx";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripe_customer_id",
ADD COLUMN     "payment_customer_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "subscriptions_payment_customer_id_idx" ON "subscriptions"("payment_customer_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payment_customer_id_fkey" FOREIGN KEY ("payment_customer_id") REFERENCES "stripe_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
