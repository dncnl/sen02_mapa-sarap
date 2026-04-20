/**
 * API Endpoint: /api/dish-reviews
 * GET  -> returns reviews + rating summary for a specific dish
 * POST -> creates or updates a review for an authenticated user and dish
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
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    if (req.method === 'GET') {
      const { dishId } = req.query;
      const parsedDishId = parseInt(dishId, 10);

      if (!Number.isInteger(parsedDishId) || parsedDishId <= 0) {
        return res.status(400).json({ error: 'Valid dishId query parameter required' });
      }

      const dishExists = await client.query(
        'SELECT id FROM dishes WHERE id = $1 LIMIT 1',
        [parsedDishId]
      );

      if (dishExists.rows.length === 0) {
        return res.status(404).json({ error: 'Dish not found' });
      }

      const summaryResult = await client.query(
        `SELECT
           COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating,
           COUNT(*)::int AS total_reviews
         FROM dish_reviews
         WHERE dish_id = $1`,
        [parsedDishId]
      );

      const reviewsResult = await client.query(
        `SELECT
           dr.id,
           dr.user_id,
           u.username AS user_name,
           dr.dish_id,
           dr.rating,
           dr.review_text,
           dr.created_at
         FROM dish_reviews dr
         JOIN users u ON dr.user_id = u.id
         WHERE dr.dish_id = $1
         ORDER BY dr.created_at DESC`,
        [parsedDishId]
      );

      return res.status(200).json({
        dishId: parsedDishId,
        avgRating: parseFloat(summaryResult.rows[0].avg_rating || 0),
        totalReviews: parseInt(summaryResult.rows[0].total_reviews, 10) || 0,
        reviews: reviewsResult.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          userName: row.user_name,
          dishId: row.dish_id,
          rating: row.rating,
          comment: row.review_text || '',
          date: row.created_at,
        })),
      });
    }

    const authUser = getAuthUser(req);
    if (!authUser?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const body = await parseJsonBody(req);
    const dishId = parseInt(body.dishId, 10);
    const rating = parseInt(body.rating, 10);
    const comment = String(body.comment || '').trim();

    if (!Number.isInteger(dishId) || dishId <= 0) {
      return res.status(400).json({ error: 'Valid dishId is required' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
    }

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    const dishResult = await client.query(
      'SELECT id, place_id, name FROM dishes WHERE id = $1 LIMIT 1',
      [dishId]
    );

    if (dishResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const upsertResult = await client.query(
      `INSERT INTO dish_reviews (user_id, dish_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, dish_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         review_text = EXCLUDED.review_text,
         created_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, dish_id, rating, review_text, created_at`,
      [authUser.userId, dishId, rating, comment]
    );

    const review = upsertResult.rows[0];

    const userResult = await client.query(
      'SELECT username FROM users WHERE id = $1 LIMIT 1',
      [authUser.userId]
    );

    return res.status(201).json({
      id: review.id,
      userId: review.user_id,
      userName: userResult.rows[0]?.username || 'User',
      dishId: review.dish_id,
      rating: review.rating,
      comment: review.review_text,
      date: review.created_at,
      placeId: dishResult.rows[0].place_id,
      dishName: dishResult.rows[0].name,
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
