INSERT INTO "products" (id, "stripeId", name, description, active, features, "updatedAt", "hierarchy")
VALUES
  (1, 'prod_RXfHdROfnLBsKo', 'free', 'Free features', true, '{"key1":"feature 1"}', now(), 0),
  (2, 'prod_RQDnAmArtPERmBh', 'basic', 'The basic plan to start', true, '{"key1":"feature 1","key2":"feature 2"}', now(), 1),
  (3, 'prod_RQJlgfOPUlPKEH', 'pro', 'All features unlocked', true, '{"key1":"feature 1","key2":"feature 2","key3":"feature 3"}', now(), 2);

INSERT INTO "prices" ("stripeId", "unitAmount", "currency", "interval", "productId", "updatedAt")
VALUES
  ('price_1QeZwgFhc1HIVKp4HPYAWB74', 0, 'EUR', 'month', 1, now()),
  ('price_1QXNM6Fhc1HIVKp4r9eyOT9k', 1000, 'EUR', 'month', 2, now()),
  ('price_1QXT7yFhc1HIVKp4Hmv6TeoC', 2500, 'EUR', 'month', 3, now());