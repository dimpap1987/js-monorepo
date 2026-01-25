/*
  Warnings:

  - You are about to drop the column `activityLabel` on the `organizer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationPolicy` on the `organizer_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizer_profiles" DROP COLUMN "activityLabel",
DROP COLUMN "cancellationPolicy";
