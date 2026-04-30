/**
 * Admin API: /api/admin/dishes/:id
 * GET    → single dish
 * PUT    → update dish
 * DELETE → delete dish
 * Protected: admin role only
 */

const { sql } = require('@vercel/postgres');
const { getAuthUser } = require('../../_lib/auth');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  const id = parseInt(req.query.id, 10);
  if (!id || isNaN(id)) return res.status(400).json({ error: 'Valid id param required' });

  try {
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
  } catch (error) {
    console.error('[admin/dishes/[id]]', error);
    return res.status(500).json({ error: error.message });
  }
};
