/**
 * API Endpoint: GET /api/dishes
 * Returns all dishes for a specific restaurant
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
      SELECT id, place_id, name, description, price, image_url
      FROM dishes
      WHERE place_id = $1
      ORDER BY id
    `, [placeId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
