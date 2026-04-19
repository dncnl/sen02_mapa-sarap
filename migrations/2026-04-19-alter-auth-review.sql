-- Migration: alter existing production tables for authenticated review flow
-- Target: already-provisioned Neon/Vercel database
-- Safe to run multiple times.

BEGIN;

-- 1) Remove invalid legacy rows that would violate new NOT NULL constraints.
DELETE FROM reviews
WHERE user_id IS NULL
   OR place_id IS NULL
   OR review_text IS NULL;

DELETE FROM ratings
WHERE user_id IS NULL
   OR place_id IS NULL
   OR rating IS NULL;

-- 2) De-duplicate reviews: keep newest row per (user_id, place_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, place_id
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM reviews
)
DELETE FROM reviews r
USING ranked x
WHERE r.id = x.id
  AND x.rn > 1;

-- 3) De-duplicate ratings: keep newest row per (user_id, place_id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, place_id
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM ratings
)
DELETE FROM ratings r
USING ranked x
WHERE r.id = x.id
  AND x.rn > 1;

-- 4) Enforce strict review/ratings ownership and content requirements.
ALTER TABLE reviews ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN place_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN review_text SET NOT NULL;

ALTER TABLE ratings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE ratings ALTER COLUMN place_id SET NOT NULL;
ALTER TABLE ratings ALTER COLUMN rating SET NOT NULL;

-- 5) Add uniqueness guards (idempotent).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_user_id_place_id_key'
    ) THEN
        ALTER TABLE reviews
            ADD CONSTRAINT reviews_user_id_place_id_key UNIQUE (user_id, place_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ratings_user_id_place_id_key'
    ) THEN
        ALTER TABLE ratings
            ADD CONSTRAINT ratings_user_id_place_id_key UNIQUE (user_id, place_id);
    END IF;
END $$;

COMMIT;
