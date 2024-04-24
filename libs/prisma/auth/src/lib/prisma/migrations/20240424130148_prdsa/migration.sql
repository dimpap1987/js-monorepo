/*
  Warnings:

  - You are about to drop the column `provider` on the `UnRegisteredUser` table. All the data in the column will be lost.
  - Added the required column `providerEnum` to the `UnRegisteredUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UnRegisteredUser" DROP COLUMN "provider",
ADD COLUMN     "providerEnum" "ProviderEnum" NOT NULL;
