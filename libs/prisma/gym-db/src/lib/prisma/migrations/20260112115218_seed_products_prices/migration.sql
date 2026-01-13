INSERT INTO "products" ("stripeId", name, description, active, "metadata", "updatedAt", "hierarchy")
VALUES
  (
    'prod_RXfHdROfnLBsKo', 'free', 'Free features', true, 
    '{"features": {"key1": "feature 1"}}', 
    now(), 0
  ),
  (
    'prod_RQDnAmArtPERmBh', 'basic', 'The basic plan to start', true, 
    '{"features": {"key1": "feature 1", "key2": "feature 2"}}', 
    now(), 1
  ),
  (
    'prod_RQJlgfOPUlPKEH', 'pro', 'All features unlocked', true, 
    '{"features": {"key1": "feature 1", "key2": "feature 2", "key3": "feature 3"}}', 
    now(), 2
  );
