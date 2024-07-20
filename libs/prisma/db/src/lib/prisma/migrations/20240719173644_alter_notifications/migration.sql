/*
  Warnings:

  - The primary key for the `users_notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `users_notifications` table. All the data in the column will be lost.
  - Added the required column `receiver_id` to the `users_notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users_notifications" DROP CONSTRAINT "users_notifications_user_id_fkey";

-- AlterTable
ALTER TABLE "users_notifications" DROP CONSTRAINT "users_notifications_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "receiver_id" INTEGER NOT NULL,
ADD CONSTRAINT "users_notifications_pkey" PRIMARY KEY ("receiver_id", "notification_id");

-- AddForeignKey
ALTER TABLE "users_notifications" ADD CONSTRAINT "users_notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "auth_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
