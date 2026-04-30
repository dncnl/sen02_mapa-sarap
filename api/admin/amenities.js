/**
 * Admin API: /api/admin/amenities
 * GET  → list amenities for a place (?placeId=)
 * POST → add an amenity to a place
 * Protected: admin role only
 */

const { sql } = require('@vercel/postgres');
const { getAuthUser } = require('../_lib/auth');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body || {};
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admin role required' });

  try {
    if (req.method === 'GET') {
      const placeId = req.query.placeId ? parseInt(req.query.placeId, 10) : null;

      const { rows } = placeId
        ? await sql`
            SELECT pa.*, p.name AS place_name
            FROM place_amenities pa
            JOIN places p ON p.id = pa.place_id
            WHERE pa.place_id = ${placeId}
            ORDER BY pa.id
          `
        : await sql`
            SELECT pa.*, p.name AS place_name
            FROM place_amenities pa
            JOIN places p ON p.id = pa.place_id
            ORDER BY p.name, pa.id
          `;

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { place_id, amenity } = parseBody(req);

      if (!place_id || !amenity) {
        return res.status(400).json({ error: 'place_id and amenity are required' });
      }

      const { rows } = await sql`
        INSERT INTO place_amenities (place_id, amenity)
        VALUES (${parseInt(place_id, 10)}, ${amenity.trim()})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin/amenities]', error);
    return res.status(500).json({ error: error.message });
  }
};
