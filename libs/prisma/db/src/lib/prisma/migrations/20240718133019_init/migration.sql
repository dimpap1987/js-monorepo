-- CreateEnum
CREATE TYPE "AuthRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProviderEnum" AS ENUM ('google', 'github');

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
CREATE TABLE "unregistered_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "provider" "ProviderEnum" NOT NULL,

    CONSTRAINT "unregistered_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "type" "ProviderEnum" NOT NULL,
    "profileImage" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "additional_data" JSONB,
    "link" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_notifications" (
    "user_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "sender_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_notifications_pkey" PRIMARY KEY ("user_id","notification_id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_channels" (
    "user_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,

    CONSTRAINT "users_channels_pkey" PRIMARY KEY ("user_id","channel_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_username_key" ON "auth_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "unregistered_users_token_key" ON "unregistered_users"("token");

-- CreateIndex
CREATE UNIQUE INDEX "unregistered_users_email_key" ON "unregistered_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "channels_name_key" ON "channels"("name");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_channels" ADD CONSTRAINT "users_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_channels" ADD CONSTRAINT "users_channels_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
