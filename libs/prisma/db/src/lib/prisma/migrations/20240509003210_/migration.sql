-- DropForeignKey
ALTER TABLE "users_channels" DROP CONSTRAINT "users_channels_user_id_fkey";

-- AddForeignKey
ALTER TABLE "users_channels" ADD CONSTRAINT "users_channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
