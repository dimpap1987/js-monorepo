/*
  Warnings:

  - The `provider` column on the `UnRegisteredUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProviderEnum" AS ENUM ('GOOGLE', 'GITHUB');

-- AlterTable
ALTER TABLE "UnRegisteredUser" ADD COLUMN     "profileImage" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "ProviderEnum";

-- DropEnum
DROP TYPE "Provider";

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "type" "ProviderEnum" NOT NULL,
    "profileImage" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
