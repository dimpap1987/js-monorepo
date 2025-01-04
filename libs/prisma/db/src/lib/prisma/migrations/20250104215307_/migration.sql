-- CreateIndex
CREATE INDEX "stripe_customers_userId_idx" ON "stripe_customers"("userId");

-- CreateIndex
CREATE INDEX "stripe_customers_stripe_customer_id_idx" ON "stripe_customers"("stripe_customer_id");
