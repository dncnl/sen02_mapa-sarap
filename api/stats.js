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

    // Get top rated dish
    const topDishResult = await client.query(`
      SELECT 
        d.id,
        d.name,
        p.name as restaurant_name,
        d.place_id,
        ROUND(AVG(dr.rating)::numeric, 1) as avg_rating,
        COUNT(dr.id) as review_count
      FROM dishes d
      LEFT JOIN dish_reviews dr ON d.id = dr.dish_id
      LEFT JOIN places p ON d.place_id = p.id
      GROUP BY d.id, d.name, p.name, d.place_id
      HAVING COUNT(dr.id) > 0
      ORDER BY AVG(dr.rating) DESC, COUNT(dr.id) DESC
      LIMIT 1
    `);
    
    const topRatedDish = topDishResult.rows[0] ? {
      id: topDishResult.rows[0].id,
      name: topDishResult.rows[0].name,
      restaurantName: topDishResult.rows[0].restaurant_name,
      restaurantId: topDishResult.rows[0].place_id,
      avgRating: parseFloat(topDishResult.rows[0].avg_rating),
      reviewCount: parseInt(topDishResult.rows[0].review_count)
    } : null;

    // Get count of active foodies (users with at least one review or rating)
    const activeFoodiesResult = await client.query(`
      SELECT COUNT(DISTINCT user_id) as active_count
      FROM (
        SELECT DISTINCT user_id FROM reviews
        UNION
        SELECT DISTINCT user_id FROM ratings
      ) as active_users
    `);
    const activeFoodies = parseInt(activeFoodiesResult.rows[0].active_count);

    res.status(200).json({
      totalRestaurants,
      avgRating,
      totalReviews,
      totalRatings,
      topRatedDish,
      activeFoodies
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
