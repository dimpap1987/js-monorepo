CREATE EXTENSION IF NOT EXISTS citext;


ALTER TABLE "auth_users" ALTER COLUMN "username" SET DATA TYPE CITEXT;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "currentPeriodEnd" SET NOT NULL;

-- RenameIndex
ALTER INDEX "auth_users_username_key" RENAME TO "unique_username";
