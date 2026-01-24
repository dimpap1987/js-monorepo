/*
  Warnings:

  - You are about to drop the `_ClassToClassTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClassToClassTag" DROP CONSTRAINT "_ClassToClassTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassToClassTag" DROP CONSTRAINT "_ClassToClassTag_B_fkey";

-- DropTable
DROP TABLE "_ClassToClassTag";

-- DropTable
DROP TABLE "class_tags";

-- CreateTable
CREATE TABLE "tag_categories" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,

    CONSTRAINT "tag_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "categoryId" INTEGER,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags_on_classes" (
    "tagId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "tags_on_classes_pkey" PRIMARY KEY ("tagId","classId")
);

-- CreateTable
CREATE TABLE "tags_on_organizers" (
    "tagId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,

    CONSTRAINT "tags_on_organizers_pkey" PRIMARY KEY ("tagId","organizerId")
);

-- CreateTable
CREATE TABLE "tags_on_participants" (
    "tagId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,

    CONSTRAINT "tags_on_participants_pkey" PRIMARY KEY ("tagId","participantId")
);

-- CreateTable
CREATE TABLE "tags_on_locations" (
    "tagId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "tags_on_locations_pkey" PRIMARY KEY ("tagId","locationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_categories_name_key" ON "tag_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_categories_slug_key" ON "tag_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_categoryId_idx" ON "tags"("categoryId");

-- CreateIndex
CREATE INDEX "tags_on_classes_classId_idx" ON "tags_on_classes"("classId");

-- CreateIndex
CREATE INDEX "tags_on_organizers_organizerId_idx" ON "tags_on_organizers"("organizerId");

-- CreateIndex
CREATE INDEX "tags_on_participants_participantId_idx" ON "tags_on_participants"("participantId");

-- CreateIndex
CREATE INDEX "tags_on_locations_locationId_idx" ON "tags_on_locations"("locationId");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tag_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_classes" ADD CONSTRAINT "tags_on_classes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_classes" ADD CONSTRAINT "tags_on_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_organizers" ADD CONSTRAINT "tags_on_organizers_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_organizers" ADD CONSTRAINT "tags_on_organizers_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_participants" ADD CONSTRAINT "tags_on_participants_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_participants" ADD CONSTRAINT "tags_on_participants_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_locations" ADD CONSTRAINT "tags_on_locations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags_on_locations" ADD CONSTRAINT "tags_on_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
