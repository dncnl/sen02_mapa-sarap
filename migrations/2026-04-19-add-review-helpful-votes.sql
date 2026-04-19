-- Migration: track helpful votes per review so users can only vote once.

BEGIN;

CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id SERIAL PRIMARY KEY,
    review_id INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

COMMIT;