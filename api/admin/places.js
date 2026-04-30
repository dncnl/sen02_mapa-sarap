/**
 * Admin API: /api/admin/places
 * GET  → list all places or GET single place (if ?id= is provided)
 * POST → create a new place
 * PUT  → update a place (if ?id= is provided)
 * DELETE → delete a place (if ?id= is provided)
 * Protected: admin role only
 */

const { sql } = require('@vercel/postgres');
const { getAuthUser } = require('../_lib/auth');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

  const id = req.query.id ? parseInt(req.query.id, 10) : null;

  try {
    // If ID is provided, handle specific item operations
    if (id) {
      if (req.method === 'GET') {
        const { rows } = await sql`SELECT * FROM places WHERE id = ${id}`;
        if (!rows[0]) return res.status(404).json({ error: 'Place not found' });
        return res.status(200).json(rows[0]);
      }

      if (req.method === 'PUT') {
        const {
          name, cuisine, description, address,
          latitude, longitude, price_range,
          phone, website, image_url, opening_hours, is_open,
        } = parseBody(req);

        if (!name || !cuisine) {
          return res.status(400).json({ error: 'name and cuisine are required' });
        }

        const { rows } = await sql`
          UPDATE places SET
            name          = ${name.trim()},
            cuisine       = ${cuisine.trim()},
            description   = ${description || null},
            address       = ${address || null},
            latitude      = ${latitude ? parseFloat(latitude) : null},
            longitude     = ${longitude ? parseFloat(longitude) : null},
            price_range   = ${price_range || null},
            phone         = ${phone || null},
            website       = ${website || null},
            image_url     = ${image_url || null},
            opening_hours = ${opening_hours || null},
            is_open       = ${is_open !== false && is_open !== 'false'}
          WHERE id = ${id}
          RETURNING *
        `;
        if (!rows[0]) return res.status(404).json({ error: 'Place not found' });
        return res.status(200).json(rows[0]);
      }

      if (req.method === 'DELETE') {
        const { rows } = await sql`DELETE FROM places WHERE id = ${id} RETURNING id`;
        if (!rows[0]) return res.status(404).json({ error: 'Place not found' });
        return res.status(200).json({ deleted: true, id: rows[0].id });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Handle collection operations (no ID)
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
