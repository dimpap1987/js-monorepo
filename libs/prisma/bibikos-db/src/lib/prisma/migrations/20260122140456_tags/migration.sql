-- CreateTable
CREATE TABLE "class_tags" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "class_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassToClassTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClassToClassTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_tags_name_key" ON "class_tags"("name");

-- CreateIndex
CREATE INDEX "_ClassToClassTag_B_index" ON "_ClassToClassTag"("B");

-- AddForeignKey
ALTER TABLE "_ClassToClassTag" ADD CONSTRAINT "_ClassToClassTag_A_fkey" FOREIGN KEY ("A") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToClassTag" ADD CONSTRAINT "_ClassToClassTag_B_fkey" FOREIGN KEY ("B") REFERENCES "class_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
