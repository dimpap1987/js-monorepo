/*
  Warnings:

  - Made the column `updatedAt` on table `auth_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `unregistered_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `user_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `user_role` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "auth_users" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "unregistered_users" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_role" ALTER COLUMN "updatedAt" SET NOT NULL;
