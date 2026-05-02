/**
 * API Endpoint: GET /api/restaurants
 * Returns all restaurants with computed ratings and review counts.
 *
 * Query params:
 *   - cuisine     : filter by cuisine
 *   - priceRange  : filter by price range
 *   - minRating   : filter by minimum rating
 *   - openOnly    : return only open restaurants
 *   - stats=true  : instead of restaurants, return aggregated site statistics
 *                   (folded here from the old api/stats.js to stay within the
 *                    Vercel Hobby 12-function limit)
 */

const { Client } = require('pg');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    // ── STATS MODE (?stats=true) ─────────────────────────────────────────────
    if (req.query.stats === 'true') {
      const [restaurantsRes, ratingRes, reviewsRes, ratingsRes, topDishRes, activeFoodiesRes] =
        await Promise.all([
          client.query('SELECT COUNT(*) AS count FROM places'),
          client.query('SELECT AVG(rating) AS avg_rating FROM ratings'),
          client.query('SELECT COUNT(*) AS count FROM reviews'),
          client.query('SELECT COUNT(*) AS count FROM ratings'),
          client.query(`
            SELECT d.id, d.name, p.name AS restaurant_name, d.place_id,
                   ROUND(AVG(dr.rating)::numeric, 1) AS avg_rating,
                   COUNT(dr.id) AS review_count
            FROM dishes d
            LEFT JOIN dish_reviews dr ON d.id = dr.dish_id
            LEFT JOIN places p ON d.place_id = p.id
            GROUP BY d.id, d.name, p.name, d.place_id
            HAVING COUNT(dr.id) > 0
            ORDER BY AVG(dr.rating) DESC, COUNT(dr.id) DESC
            LIMIT 1
          `),
          client.query(`
            SELECT COUNT(DISTINCT user_id) AS active_count
            FROM (
              SELECT DISTINCT user_id FROM reviews
              UNION
              SELECT DISTINCT user_id FROM ratings
            ) AS active_users
          `),
        ]);

      const topDish = topDishRes.rows[0]
        ? {
            id: topDishRes.rows[0].id,
            name: topDishRes.rows[0].name,
            restaurantName: topDishRes.rows[0].restaurant_name,
            restaurantId: topDishRes.rows[0].place_id,
            avgRating: parseFloat(topDishRes.rows[0].avg_rating),
            reviewCount: parseInt(topDishRes.rows[0].review_count),
          }
        : null;

      return res.status(200).json({
        totalRestaurants: parseInt(restaurantsRes.rows[0].count),
        avgRating: ratingRes.rows[0].avg_rating
          ? parseFloat(ratingRes.rows[0].avg_rating).toFixed(1)
          : 0,
        totalReviews: parseInt(reviewsRes.rows[0].count),
        totalRatings: parseInt(ratingsRes.rows[0].count),
        topRatedDish: topDish,
        activeFoodies: parseInt(activeFoodiesRes.rows[0].active_count),
      });
    }

    // ── RESTAURANTS MODE (default) ───────────────────────────────────────────
    const placesResult = await client.query(`
      SELECT p.*,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
             COUNT(DISTINCT r.id) AS review_count
      FROM places p
      LEFT JOIN ratings r ON p.id = r.place_id
      GROUP BY p.id
      ORDER BY p.id
    `);

    const amenitiesResult = await client.query(
      'SELECT place_id, array_agg(amenity) AS amenities FROM place_amenities GROUP BY place_id'
    );
    const dishesResult = await client.query(
      'SELECT place_id, array_agg(name) AS dishes FROM dishes GROUP BY place_id'
    );

    const amenitiesMap = {};
    amenitiesResult.rows.forEach((row) => {
      amenitiesMap[row.place_id] = row.amenities || [];
    });

    const dishesMap = {};
    dishesResult.rows.forEach((row) => {
      dishesMap[row.place_id] = row.dishes || [];
    });

    const AUF = { lat: 15.1442, lng: 120.5955 };
    function calcDist(lat, lng) {
      const dLat = (lat - AUF.lat) * 111;
      const dLng = (lng - AUF.lng) * 111 * Math.cos((lat * Math.PI) / 180);
      const d = Math.sqrt(dLat ** 2 + dLng ** 2);
      return d < 0.1 ? '< 0.1 km' : `${d.toFixed(1)} km`;
    }

    let restaurants = placesResult.rows.map((place) => ({
      id: place.id,
      name: place.name,
      cuisine: place.cuisine,
      description: place.description,
      address: place.address || 'Address TBD',
      lat: parseFloat(place.latitude) || AUF.lat,
      lng: parseFloat(place.longitude) || AUF.lng,
      priceRange: place.price_range,
      phone: place.phone || 'N/A',
      website: place.website,
      imageUrl: place.image_url,
      hours: place.opening_hours,
      status: place.is_open ? 'Open' : 'Closed',
      rating: parseFloat(place.avg_rating) || 0,
      reviewCount: parseInt(place.review_count) || 0,
      distance: calcDist(parseFloat(place.latitude), parseFloat(place.longitude)),
      amenities: amenitiesMap[place.id] || [],
      popularDishes: dishesMap[place.id] || [],
    }));

    if (req.query.cuisine && req.query.cuisine !== 'All') {
      restaurants = restaurants.filter((r) => r.cuisine === req.query.cuisine);
    }
    if (req.query.priceRange && req.query.priceRange !== 'All') {
      restaurants = restaurants.filter((r) => r.priceRange === req.query.priceRange);
    }
    if (req.query.minRating) {
      const min = parseFloat(req.query.minRating);
      restaurants = restaurants.filter((r) => r.rating >= min);
    }
    if (req.query.openOnly === 'true') {
      restaurants = restaurants.filter((r) => r.status === 'Open');
    }

    return res.status(200).json(restaurants);
  } catch (error) {
    console.error('Restaurants API error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
