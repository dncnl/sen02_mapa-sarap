/**
 * Admin API: /api/admin/dishes
 * GET  → list dishes (optionally filter by ?placeId=) or GET single dish (if ?id= is provided)
 * POST → create a new dish
 * PUT  → update a dish (if ?id= is provided)
 * DELETE → delete a dish (if ?id= is provided)
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
    if (id) {
      if (req.method === 'GET') {
        const { rows } = await sql`SELECT * FROM dishes WHERE id = ${id}`;
        if (!rows[0]) return res.status(404).json({ error: 'Dish not found' });
        return res.status(200).json(rows[0]);
      }

      if (req.method === 'PUT') {
        const { place_id, name, description, price, image_url } = parseBody(req);

        if (!place_id || !name) {
          return res.status(400).json({ error: 'place_id and name are required' });
        }

        const { rows } = await sql`
          UPDATE dishes SET
            place_id    = ${parseInt(place_id, 10)},
            name        = ${name.trim()},
            description = ${description || null},
            price       = ${price ? parseFloat(price) : null},
            image_url   = ${image_url || null}
          WHERE id = ${id}
          RETURNING *
        `;
        if (!rows[0]) return res.status(404).json({ error: 'Dish not found' });
        return res.status(200).json(rows[0]);
      }

      if (req.method === 'DELETE') {
        const { rows } = await sql`DELETE FROM dishes WHERE id = ${id} RETURNING id`;
        if (!rows[0]) return res.status(404).json({ error: 'Dish not found' });
        return res.status(200).json({ deleted: true, id: rows[0].id });
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Handle collection operations (no ID)
    if (req.method === 'GET') {
      const placeId = req.query.placeId ? parseInt(req.query.placeId, 10) : null;

      const { rows } = placeId
        ? await sql`
            SELECT d.*, p.name AS place_name
            FROM dishes d
            JOIN places p ON p.id = d.place_id
            WHERE d.place_id = ${placeId}
            ORDER BY d.id DESC
          `
        : await sql`
            SELECT d.*, p.name AS place_name
            FROM dishes d
            JOIN places p ON p.id = d.place_id
            ORDER BY d.id DESC
          `;

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { place_id, name, description, price, image_url } = parseBody(req);

      if (!place_id || !name) {
        return res.status(400).json({ error: 'place_id and name are required' });
      }

      const { rows } = await sql`
        INSERT INTO dishes (place_id, name, description, price, image_url)
        VALUES (
          ${parseInt(place_id, 10)},
          ${name.trim()},
          ${description || null},
          ${price ? parseFloat(price) : null},
          ${image_url || null}
        )
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin/dishes]', error);
    return res.status(500).json({ error: error.message });
  }
};
