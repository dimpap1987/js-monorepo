/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `stripe_webhook_events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_event_id_key" ON "stripe_webhook_events"("event_id");
