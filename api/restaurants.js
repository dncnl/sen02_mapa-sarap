/**
 * API Endpoint: GET /api/restaurants
 * Returns all restaurants with computed ratings and review counts
 * 
 * Query params:
 *   - cuisine: filter by cuisine
 *   - priceRange: filter by price range
 *   - minRating: filter by minimum rating
 *   - openOnly: return only open restaurants
 */

const { sql } = require('@vercel/postgres');

// Helper function to calculate average rating
function calculateAverageRating(ratings) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / ratings.length).toFixed(1));
}

// Helper function to calculate distance
function calculateDistance(lat, lng) {
  const auf = { lat: 15.1442, lng: 120.5955 };
  const latDiff = (lat - auf.lat) * 111;
  const lngDiff = (lng - auf.lng) * 111 * Math.cos((lat * Math.PI) / 180);
  const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
  return distance < 0.1 ? '< 0.1 km' : `${distance.toFixed(1)} km`;
}

module.exports = async (req, res) => {
  try {
    // Fetch all places with ratings
    const placesResult = await sql`
      SELECT p.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM places p
      LEFT JOIN ratings r ON p.id = r.place_id
      GROUP BY p.id
      ORDER BY p.id;
    `;

    // Fetch all amenities
    const amenitiesResult = await sql`SELECT place_id, array_agg(amenity) as amenities FROM place_amenities GROUP BY place_id;`;

    // Fetch all dishes with names only
    const dishesResult = await sql`SELECT place_id, array_agg(name) as dishes FROM dishes GROUP BY place_id;`;

    // Create lookup maps
    const amenitiesMap = {};
    amenitiesResult.rows.forEach(row => {
      amenitiesMap[row.place_id] = row.amenities || [];
    });

    const dishesMap = {};
    dishesResult.rows.forEach(row => {
      dishesMap[row.place_id] = row.dishes || [];
    });

    // Transform to frontend format
    const restaurants = placesResult.rows.map(place => ({
      id: place.id,
      name: place.name,
      cuisine: place.cuisine,
      description: place.description,
      address: place.address,
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      priceRange: place.price_range,
      phone: place.phone,
      website: place.website,
      imageUrl: place.image_url,
      hours: place.opening_hours,
      status: place.is_open ? 'Open' : 'Closed',
      rating: parseFloat(place.avg_rating) || 0,
      reviewCount: parseInt(place.review_count) || 0,
      distance: calculateDistance(parseFloat(place.latitude), parseFloat(place.longitude)),
      amenities: amenitiesMap[place.id] || [],
      popularDishes: dishesMap[place.id] || [],
    }));

    // Apply filters if provided
    let filtered = restaurants;
    
    if (req.query.cuisine && req.query.cuisine !== 'All') {
      filtered = filtered.filter(r => r.cuisine === req.query.cuisine);
    }
    
    if (req.query.priceRange && req.query.priceRange !== 'All') {
      filtered = filtered.filter(r => r.priceRange === req.query.priceRange);
    }
    
    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating);
      filtered = filtered.filter(r => r.rating >= minRating);
    }
    
    if (req.query.openOnly === 'true') {
      filtered = filtered.filter(r => r.status === 'Open');
    }

    res.status(200).json(filtered);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
};
