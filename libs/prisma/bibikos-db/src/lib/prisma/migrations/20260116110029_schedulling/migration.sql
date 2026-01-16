-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'WAITLISTED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "app_users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authUserId" INTEGER NOT NULL,
    "fullName" TEXT,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-US',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "countryCode" CHAR(2),

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_profiles" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appUserId" INTEGER NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "slug" VARCHAR(100),
    "activityLabel" VARCHAR(255),
    "cancellationPolicy" TEXT,
    "defaultLocationId" INTEGER,

    CONSTRAINT "organizer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_profiles" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appUserId" INTEGER NOT NULL,

    CONSTRAINT "participant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "city" VARCHAR(255),
    "address" TEXT,
    "timezone" VARCHAR(50) NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "onlineUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "waitlistLimit" INTEGER,
    "isCapacitySoft" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER NOT NULL,
    "startTimeUtc" TIMESTAMPTZ NOT NULL,
    "endTimeUtc" TIMESTAMPTZ NOT NULL,
    "localTimezone" VARCHAR(50) NOT NULL,
    "recurrenceRule" VARCHAR(500),
    "occurrenceDate" VARCHAR(10),
    "parentScheduleId" INTEGER,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" VARCHAR(500),

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classScheduleId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "waitlistPosition" INTEGER,
    "cancelledByOrganizer" BOOLEAN NOT NULL DEFAULT false,
    "cancelReason" VARCHAR(500),
    "organizerNotes" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_authUserId_key" ON "app_users"("authUserId");

-- CreateIndex
CREATE INDEX "app_users_authUserId_idx" ON "app_users"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profiles_appUserId_key" ON "organizer_profiles"("appUserId");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profiles_slug_key" ON "organizer_profiles"("slug");

-- CreateIndex
CREATE INDEX "organizer_profiles_appUserId_idx" ON "organizer_profiles"("appUserId");

-- CreateIndex
CREATE INDEX "organizer_profiles_slug_idx" ON "organizer_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "participant_profiles_appUserId_key" ON "participant_profiles"("appUserId");

-- CreateIndex
CREATE INDEX "participant_profiles_appUserId_idx" ON "participant_profiles"("appUserId");

-- CreateIndex
CREATE INDEX "locations_organizerId_idx" ON "locations"("organizerId");

-- CreateIndex
CREATE INDEX "locations_countryCode_idx" ON "locations"("countryCode");

-- CreateIndex
CREATE INDEX "locations_isOnline_idx" ON "locations"("isOnline");

-- CreateIndex
CREATE INDEX "classes_organizerId_idx" ON "classes"("organizerId");

-- CreateIndex
CREATE INDEX "classes_locationId_idx" ON "classes"("locationId");

-- CreateIndex
CREATE INDEX "classes_isActive_idx" ON "classes"("isActive");

-- CreateIndex
CREATE INDEX "class_schedules_classId_idx" ON "class_schedules"("classId");

-- CreateIndex
CREATE INDEX "class_schedules_startTimeUtc_idx" ON "class_schedules"("startTimeUtc");

-- CreateIndex
CREATE INDEX "class_schedules_parentScheduleId_idx" ON "class_schedules"("parentScheduleId");

-- CreateIndex
CREATE INDEX "class_schedules_isCancelled_idx" ON "class_schedules"("isCancelled");

-- CreateIndex
CREATE INDEX "bookings_classScheduleId_idx" ON "bookings"("classScheduleId");

-- CreateIndex
CREATE INDEX "bookings_participantId_idx" ON "bookings"("participantId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_waitlistPosition_idx" ON "bookings"("waitlistPosition");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_classScheduleId_participantId_key" ON "bookings"("classScheduleId", "participantId");

-- AddForeignKey
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_profiles" ADD CONSTRAINT "organizer_profiles_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_profiles" ADD CONSTRAINT "organizer_profiles_defaultLocationId_fkey" FOREIGN KEY ("defaultLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_profiles" ADD CONSTRAINT "participant_profiles_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_parentScheduleId_fkey" FOREIGN KEY ("parentScheduleId") REFERENCES "class_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_classScheduleId_fkey" FOREIGN KEY ("classScheduleId") REFERENCES "class_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
