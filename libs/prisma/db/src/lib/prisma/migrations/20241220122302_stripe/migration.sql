/*
  Warnings:

  - You are about to drop the column `data` on the `stripe_webhook_events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stripe_webhook_events" DROP COLUMN "data";
