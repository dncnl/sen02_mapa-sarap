/**
 * API Endpoint: /api/reviews
 * GET    -> returns reviews for a specific restaurant
 * POST   -> creates a review for an authenticated user
 * PATCH  -> toggles helpful vote for an authenticated user
 * DELETE -> deletes a review for its authenticated owner only
 */

const { Client } = require('pg');
const { getAuthUser } = require('./_lib/auth');

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim() !== '') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return await new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        resolve({});
      }
    });
  });
}

module.exports = async (req, res) => {
  // CORS-friendly pre-flight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    if (req.method === 'GET') {
      const { placeId } = req.query;
      const authUser = getAuthUser(req);
      const viewerUserId = authUser?.userId ? parseInt(authUser.userId, 10) : null;

      if (!placeId) {
        return res.status(400).json({ error: 'placeId query parameter required' });
      }

      // Fetch reviews with user and rating information
      const result = await client.query(`
        SELECT 
          r.id,
          r.user_id,
          u.username as user_name,
          r.place_id as restaurant_id,
          r.review_text as comment,
          r.helpful_count,
          r.created_at as date,
          ra.rating,
          EXISTS (
            SELECT 1
            FROM review_helpful_votes rv
            WHERE rv.review_id = r.id
              AND rv.user_id = $2
          ) AS has_helpful_vote
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN ratings ra ON r.user_id = ra.user_id AND r.place_id = ra.place_id
        WHERE r.place_id = $1
        ORDER BY r.created_at DESC
      `, [placeId, viewerUserId]);

      const reviews = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        restaurantId: row.restaurant_id,
        userName: row.user_name,
        rating: row.rating || 5,
        comment: row.comment,
        date: row.date,
        helpfulCount: row.helpful_count,
        hasHelpfulVote: !!row.has_helpful_vote,
      }));

      return res.status(200).json(reviews);
    }

    if (req.method === 'PATCH') {
      const authUser = getAuthUser(req);
      if (!authUser?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const body = await parseJsonBody(req);
      const reviewId = parseInt(body.reviewId, 10);

      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        return res.status(400).json({ error: 'Valid reviewId is required' });
      }

      const reviewResult = await client.query(
        'SELECT id FROM reviews WHERE id = $1 LIMIT 1',
        [reviewId]
      );

      if (reviewResult.rows.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      await client.query('BEGIN');

      try {
        const existingVote = await client.query(
          `SELECT id
           FROM review_helpful_votes
           WHERE review_id = $1 AND user_id = $2
           LIMIT 1`,
          [reviewId, authUser.userId]
        );

        let updatedResult;
        let voted;

        if (existingVote.rows.length > 0) {
          await client.query(
            `DELETE FROM review_helpful_votes
             WHERE review_id = $1 AND user_id = $2`,
            [reviewId, authUser.userId]
          );

          updatedResult = await client.query(
            `UPDATE reviews
             SET helpful_count = GREATEST(helpful_count - 1, 0)
             WHERE id = $1
             RETURNING helpful_count`,
            [reviewId]
          );
          voted = false;
        } else {
          await client.query(
            `INSERT INTO review_helpful_votes (review_id, user_id)
             VALUES ($1, $2)`,
            [reviewId, authUser.userId]
          );

          updatedResult = await client.query(
            `UPDATE reviews
             SET helpful_count = helpful_count + 1
             WHERE id = $1
             RETURNING helpful_count`,
            [reviewId]
          );
          voted = true;
        }

        await client.query('COMMIT');

        return res.status(200).json({
          reviewId,
          helpfulCount: parseInt(updatedResult.rows[0].helpful_count, 10) || 0,
          voted,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    if (req.method === 'DELETE') {
      const authUser = getAuthUser(req);
      if (!authUser?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const body = await parseJsonBody(req);
      const reviewId = parseInt(body.reviewId, 10);

      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        return res.status(400).json({ error: 'Valid reviewId is required' });
      }

      const reviewResult = await client.query(
        `SELECT id, user_id, place_id
         FROM reviews
         WHERE id = $1
         LIMIT 1`,
        [reviewId]
      );

      if (reviewResult.rows.length === 0) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const review = reviewResult.rows[0];
      if (parseInt(review.user_id, 10) !== parseInt(authUser.userId, 10)) {
        return res.status(403).json({ error: 'You can only delete your own review' });
      }

      await client.query('BEGIN');

      try {
        await client.query(
          `DELETE FROM reviews
           WHERE id = $1 AND user_id = $2`,
          [reviewId, authUser.userId]
        );

        await client.query(
          `DELETE FROM ratings
           WHERE user_id = $1 AND place_id = $2`,
          [authUser.userId, review.place_id]
        );

        await client.query('COMMIT');

        return res.status(200).json({
          reviewId,
          deleted: true,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    const authUser = getAuthUser(req);
    if (!authUser?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const body = await parseJsonBody(req);
    const placeId = parseInt(body.placeId, 10);
    const rating = parseInt(body.rating, 10);
    const comment = String(body.comment || '').trim();

    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Valid placeId is required' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
    }

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    const userResult = await client.query('SELECT id, username FROM users WHERE id = $1 LIMIT 1', [authUser.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User account not found' });
    }

    const placeResult = await client.query('SELECT id FROM places WHERE id = $1 LIMIT 1', [placeId]);
    if (placeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    await client.query('BEGIN');

    const reviewInsert = await client.query(
      `INSERT INTO reviews (user_id, place_id, review_text, helpful_count)
       VALUES ($1, $2, $3, 0)
       ON CONFLICT (user_id, place_id)
       DO UPDATE SET
         review_text = EXCLUDED.review_text,
         updated_at  = CURRENT_TIMESTAMP
       RETURNING id, place_id, review_text, helpful_count, created_at`,
      [authUser.userId, placeId, comment]
    );

    await client.query(
      `INSERT INTO ratings (user_id, place_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, place_id)
       DO UPDATE SET rating = EXCLUDED.rating`,
      [authUser.userId, placeId, rating]
    );

    await client.query('COMMIT');

    const created = reviewInsert.rows[0];
    return res.status(201).json({
      id: created.id,
      restaurantId: created.place_id,
      userName: userResult.rows[0].username,
      rating,
      comment: created.review_text,
      date: created.created_at,
      helpfulCount: created.helpful_count,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // Ignore rollback errors.
    }
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
