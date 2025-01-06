INSERT INTO "products" (id, "stripeId", name, description, active, features, "updatedAt")
VALUES
  (1, 'prod_RQNmZkTFUlPKEXH', 'Free Plan', 'Free features', true, '{"key1":"feature 1"}', now()),
  (2, 'prod_RQDnAmArtPERmBh', 'Basic Plan', 'The basic plan to start', true, '{"key1":"feature 1","key2":"feature 2"}', now()),
  (3, 'prod_RQJlgfOPUlPKEH', 'Pro Plan', 'All features unlocked', true, '{"key1":"feature 1","key2":"feature 2","key3":"feature 3"}', now());

INSERT INTO "prices" ("stripeId", "unitAmount", "currency", "interval", "productId", "updatedAt")
VALUES
  ('price_1QXNM6Fhc1HIVKp4r9eyOT9k', 1000, 'EUR', 'month', 2, now()),
  ('price_2QXT6XFhc1HIVKp4Jkaj7I0E', 10000, 'EUR', 'year', 2, now()),
  ('price_1QXT7yFhc1HIVKp4Hmv6TeoC', 2500, 'EUR', 'month', 3, now()),
  ('price_1QXT8TFhc1HIVKp4EV8n4CX0', 20000, 'EUR', 'year', 3, now()),
  ('free_month', 0, 'EUR', 'month', 1, now()),
  ('free_year', 0, 'EUR', 'year', 1, now());