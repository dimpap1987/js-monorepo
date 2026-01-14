/*
  Warnings:

  - You are about to drop the column `isActive` on the `auth_users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'BANNED');

-- DropIndex
DROP INDEX "auth_users_isActive_idx";

-- AlterTable
ALTER TABLE "auth_users" DROP COLUMN "isActive",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "auth_users_status_idx" ON "auth_users"("status");
