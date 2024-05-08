-- CreateEnum
CREATE TYPE "AuthRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProviderEnum" AS ENUM ('GOOGLE', 'GITHUB');

-- CreateTable
CREATE TABLE "auth_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roles" "AuthRole"[] DEFAULT ARRAY['USER']::"AuthRole"[],

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unregister_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "providerEnum" "ProviderEnum" NOT NULL,

    CONSTRAINT "unregister_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "type" "ProviderEnum" NOT NULL,
    "profileImage" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_username_key" ON "auth_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "unregister_users_token_key" ON "unregister_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "unregister_users_email_key" ON "unregister_users"("email");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
