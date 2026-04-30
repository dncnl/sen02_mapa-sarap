/**
 * Admin API: /api/admin/places
 * GET  → list all places (with dish/amenity counts)
 * POST → create a new place
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
      const { rows } = await sql`
        SELECT p.*,
               COUNT(DISTINCT d.id)::int  AS dish_count,
               COUNT(DISTINCT a.id)::int  AS amenity_count
        FROM places p
        LEFT JOIN dishes d          ON p.id = d.place_id
        LEFT JOIN place_amenities a ON p.id = a.place_id
        GROUP BY p.id
        ORDER BY p.id DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const {
        name, cuisine, description, address,
        latitude, longitude, price_range,
        phone, website, image_url, opening_hours, is_open,
      } = parseBody(req);

      if (!name || !cuisine) {
        return res.status(400).json({ error: 'name and cuisine are required' });
      }

      const { rows } = await sql`
        INSERT INTO places
          (name, cuisine, description, address, latitude, longitude,
           price_range, phone, website, image_url, opening_hours, is_open)
        VALUES
          (${name.trim()}, ${cuisine.trim()},
           ${description || null}, ${address || null},
           ${latitude ? parseFloat(latitude) : null},
           ${longitude ? parseFloat(longitude) : null},
           ${price_range || null}, ${phone || null},
           ${website || null}, ${image_url || null},
           ${opening_hours || null}, ${is_open !== false && is_open !== 'false'})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin/places]', error);
    return res.status(500).json({ error: error.message });
  }
};
