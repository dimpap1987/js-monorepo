-- Seed Tag Categories
INSERT INTO "tag_categories" ("name", "slug", "createdAt", "updatedAt") VALUES
  ('Activity Type', 'activity-type', NOW(), NOW()),
  ('Skill Level', 'skill-level', NOW(), NOW()),
  ('Class Format', 'class-format', NOW(), NOW()),
  ('Amenities', 'amenities', NOW(), NOW()),
  ('Specialty', 'specialty', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Seed Tags for Activity Type (applicable to CLASS, ORGANIZER)
INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Yoga', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Pilates', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'HIIT', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Strength Training', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Dance', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Meditation', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'CrossFit', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Martial Arts', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Swimming', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Cycling', id, ARRAY['CLASS', 'ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'activity-type'
ON CONFLICT ("name") DO NOTHING;

-- Seed Tags for Skill Level (applicable to CLASS)
INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Beginner', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'skill-level'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Intermediate', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'skill-level'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Advanced', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'skill-level'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'All Levels', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'skill-level'
ON CONFLICT ("name") DO NOTHING;

-- Seed Tags for Class Format (applicable to CLASS)
INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Group Class', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'class-format'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Private Session', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'class-format'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Workshop', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'class-format'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Online', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'class-format'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'In-Person', id, ARRAY['CLASS']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'class-format'
ON CONFLICT ("name") DO NOTHING;

-- Seed Tags for Amenities (applicable to LOCATION)
INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Parking Available', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Showers', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Lockers', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Wheelchair Accessible', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Air Conditioning', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Equipment Provided', id, ARRAY['LOCATION']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'amenities'
ON CONFLICT ("name") DO NOTHING;

-- Seed Tags for Specialty (applicable to ORGANIZER)
INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Certified Instructor', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Prenatal Specialist', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Senior Fitness', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Sports Rehabilitation', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Kids Fitness', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "tags" ("name", "categoryId", "applicableTo", "createdAt", "updatedAt")
SELECT 'Weight Loss', id, ARRAY['ORGANIZER']::"TagEntityType"[], NOW(), NOW()
FROM "tag_categories" WHERE "slug" = 'specialty'
ON CONFLICT ("name") DO NOTHING;
