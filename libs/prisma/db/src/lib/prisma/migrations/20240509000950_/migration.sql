/*
  Warnings:

  - The primary key for the `users_channels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users_channels` table. All the data in the column will be lost.
  - The primary key for the `users_notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users_notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users_channels" DROP CONSTRAINT "users_channels_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "users_channels_pkey" PRIMARY KEY ("user_id", "channel_id");

-- AlterTable
ALTER TABLE "users_notifications" DROP CONSTRAINT "users_notifications_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "users_notifications_pkey" PRIMARY KEY ("user_id", "notification_id");
