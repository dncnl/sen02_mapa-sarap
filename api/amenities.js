/**
 * API Endpoint: GET /api/amenities
 * Returns all amenities for a specific restaurant
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

    const result = await client.query(`
      SELECT id, place_id, amenity
      FROM place_amenities
      WHERE place_id = $1
      ORDER BY id
    `, [placeId]);

    const amenities = result.rows.map(row => row.amenity);
    res.status(200).json(amenities);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
