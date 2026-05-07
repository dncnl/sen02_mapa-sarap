-- Migration: track helpful votes per dish review so users can only vote once.
-- Also add helpful_count to dish_reviews.

BEGIN;

ALTER TABLE dish_reviews
ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS dish_review_helpful_votes (
    id SERIAL PRIMARY KEY,
    dish_review_id INT NOT NULL REFERENCES dish_reviews(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dish_review_id, user_id)
);

COMMIT;
