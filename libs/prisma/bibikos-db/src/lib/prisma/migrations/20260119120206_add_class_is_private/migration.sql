-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "classes_isPrivate_idx" ON "classes"("isPrivate");
