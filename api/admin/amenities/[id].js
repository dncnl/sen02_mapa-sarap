/**
 * Admin API: /api/admin/amenities/:id
 * DELETE → remove a single amenity row
 * Protected: admin role only
 */

const { sql } = require('@vercel/postgres');
const { getAuthUser } = require('../../_lib/auth');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    if (req.method === 'DELETE') {
      const { rows } = await sql`DELETE FROM place_amenities WHERE id = ${id} RETURNING id`;
      if (!rows[0]) return res.status(404).json({ error: 'Amenity not found' });
      return res.status(200).json({ deleted: true, id: rows[0].id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[admin/amenities/[id]]', error);
    return res.status(500).json({ error: error.message });
  }
};
