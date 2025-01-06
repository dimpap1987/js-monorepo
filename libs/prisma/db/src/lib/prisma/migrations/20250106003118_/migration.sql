/*
  Warnings:

  - Changed the type of `priceId` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "priceId",
ADD COLUMN     "priceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "subscriptions_priceId_idx" ON "subscriptions"("priceId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
