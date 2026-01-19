-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "class_invitations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "invitedUserId" INTEGER,
    "invitedUsername" VARCHAR(100),
    "invitedEmail" VARCHAR(255),
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "class_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_invitations_classId_idx" ON "class_invitations"("classId");

-- CreateIndex
CREATE INDEX "class_invitations_organizerId_idx" ON "class_invitations"("organizerId");

-- CreateIndex
CREATE INDEX "class_invitations_invitedUserId_idx" ON "class_invitations"("invitedUserId");

-- CreateIndex
CREATE INDEX "class_invitations_invitedEmail_idx" ON "class_invitations"("invitedEmail");

-- CreateIndex
CREATE INDEX "class_invitations_invitedUsername_idx" ON "class_invitations"("invitedUsername");

-- CreateIndex
CREATE INDEX "class_invitations_status_idx" ON "class_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "class_invitations_classId_invitedUserId_key" ON "class_invitations"("classId", "invitedUserId");

-- AddForeignKey
ALTER TABLE "class_invitations" ADD CONSTRAINT "class_invitations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_invitations" ADD CONSTRAINT "class_invitations_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_invitations" ADD CONSTRAINT "class_invitations_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
