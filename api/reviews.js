/**
 * API Endpoint: GET /api/reviews
 * Returns reviews for a specific restaurant with user information
 * 
 * Query params:
 *   - placeId: restaurant ID (required)
 */

const { Client } = require('pg');

module.exports = async (req, res) => {
  const { placeId } = req.query;

  if (!placeId) {
    return res.status(400).json({ error: 'placeId query parameter required' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

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
        ra.rating
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings ra ON r.user_id = ra.user_id AND r.place_id = ra.place_id
      WHERE r.place_id = $1
      ORDER BY r.created_at DESC
    `, [placeId]);

    const reviews = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      userName: row.user_name,
      rating: row.rating || 5,
      comment: row.comment,
      date: row.date,
      helpfulCount: row.helpful_count,
    }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
