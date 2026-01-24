-- Manual Migration: Refactor Tags System
-- This migration transforms the tightly-coupled ClassTag model into a generic tagging system
--
-- Run with: pnpm db:bibikos:migrate after reviewing this file

-- =============================================================================
-- Step 1: Create new tables
-- =============================================================================

-- Tag Categories table
CREATE TABLE IF NOT EXISTS "tag_categories" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    CONSTRAINT "tag_categories_name_key" UNIQUE ("name"),
    CONSTRAINT "tag_categories_slug_key" UNIQUE ("slug")
);

-- Tags table (replaces class_tags)
CREATE TABLE IF NOT EXISTS "tags" (
    "id" SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "categoryId" INTEGER,
    CONSTRAINT "tags_name_key" UNIQUE ("name"),
    CONSTRAINT "tags_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tag_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "tags_categoryId_idx" ON "tags"("categoryId");

-- Junction table: Tags on Classes
CREATE TABLE IF NOT EXISTS "tags_on_classes" (
    "tagId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "tags_on_classes_pkey" PRIMARY KEY ("tagId", "classId"),
    CONSTRAINT "tags_on_classes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tags_on_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tags_on_classes_classId_idx" ON "tags_on_classes"("classId");

-- Junction table: Tags on Organizers
CREATE TABLE IF NOT EXISTS "tags_on_organizers" (
    "tagId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,
    CONSTRAINT "tags_on_organizers_pkey" PRIMARY KEY ("tagId", "organizerId"),
    CONSTRAINT "tags_on_organizers_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tags_on_organizers_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tags_on_organizers_organizerId_idx" ON "tags_on_organizers"("organizerId");

-- Junction table: Tags on Participants
CREATE TABLE IF NOT EXISTS "tags_on_participants" (
    "tagId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,
    CONSTRAINT "tags_on_participants_pkey" PRIMARY KEY ("tagId", "participantId"),
    CONSTRAINT "tags_on_participants_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tags_on_participants_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tags_on_participants_participantId_idx" ON "tags_on_participants"("participantId");

-- Junction table: Tags on Locations
CREATE TABLE IF NOT EXISTS "tags_on_locations" (
    "tagId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    CONSTRAINT "tags_on_locations_pkey" PRIMARY KEY ("tagId", "locationId"),
    CONSTRAINT "tags_on_locations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tags_on_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "tags_on_locations_locationId_idx" ON "tags_on_locations"("locationId");

-- =============================================================================
-- Step 2: Migrate existing data from class_tags
-- =============================================================================

-- Insert existing tags into new tags table (if class_tags exists)
INSERT INTO "tags" ("id", "createdAt", "updatedAt", "name")
SELECT "id", "createdAt", "updatedAt", "name"
FROM "class_tags"
ON CONFLICT ("name") DO NOTHING;

-- Migrate the many-to-many relationships
-- The old schema used implicit M2M via _ClassTagToClass table
-- Check if the implicit join table exists and migrate data
INSERT INTO "tags_on_classes" ("tagId", "classId")
SELECT "A" as "tagId", "B" as "classId"
FROM "_ClassTagToClass"
ON CONFLICT DO NOTHING;

-- Reset sequence to continue from max id
SELECT setval(pg_get_serial_sequence('tags', 'id'), COALESCE((SELECT MAX(id) FROM tags), 0) + 1, false);

-- =============================================================================
-- Step 3: Clean up old tables (run after verifying migration success)
-- =============================================================================

-- CAUTION: Only run these after verifying the migration worked correctly!
-- DROP TABLE IF EXISTS "_ClassTagToClass";
-- DROP TABLE IF EXISTS "class_tags";
