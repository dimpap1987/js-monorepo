-- CreateEnum
CREATE TYPE "TagEntityType" AS ENUM ('CLASS', 'ORGANIZER', 'LOCATION', 'PARTICIPANT');

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "applicableTo" "TagEntityType"[];
