/**
 * API Endpoint: GET /api/stats
 * Returns aggregated statistics across all restaurants
 */

const { Client } = require('pg');

module.exports = async (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    // Get total restaurants
    const restaurantsResult = await client.query('SELECT COUNT(*) as count FROM places');
    const totalRestaurants = parseInt(restaurantsResult.rows[0].count);

    // Get average rating
    const ratingResult = await client.query(`
      SELECT AVG(rating) as avg_rating FROM ratings
    `);
    const avgRating = ratingResult.rows[0].avg_rating ? 
      parseFloat(ratingResult.rows[0].avg_rating).toFixed(1) : 0;

    // Get total reviews
    const reviewsResult = await client.query('SELECT COUNT(*) as count FROM reviews');
    const totalReviews = parseInt(reviewsResult.rows[0].count);

    // Get total ratings
    const ratingsResult = await client.query('SELECT COUNT(*) as count FROM ratings');
    const totalRatings = parseInt(ratingsResult.rows[0].count);

    res.status(200).json({
      totalRestaurants,
      avgRating,
      totalReviews,
      totalRatings,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
