-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "replaced_by_price_id" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "prices_status_idx" ON "prices"("status");

-- CreateIndex
CREATE INDEX "prices_replaced_by_price_id_idx" ON "prices"("replaced_by_price_id");

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_replaced_by_price_id_fkey" FOREIGN KEY ("replaced_by_price_id") REFERENCES "prices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
