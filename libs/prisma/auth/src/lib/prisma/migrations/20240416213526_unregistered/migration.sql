-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'GITHUB');

-- CreateTable
CREATE TABLE "UnRegisteredUser" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider" "Provider",

    CONSTRAINT "UnRegisteredUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnRegisteredUser_token_key" ON "UnRegisteredUser"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UnRegisteredUser_email_key" ON "UnRegisteredUser"("email");
