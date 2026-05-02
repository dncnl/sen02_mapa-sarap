/**
 * API Endpoint: /api/favorites
 * GET    -> returns all favorited place IDs for the authenticated user
 * POST   -> adds a favorite (requires auth)
 * DELETE -> removes a favorite (requires auth)
 *
 * Replaces api/stats.js (stats are now served via /api/restaurants?stats=true)
 * to stay within Vercel Hobby plan's 12-function limit.
 */

const { Client } = require('pg');
const { getAuthUser } = require('./_lib/auth');

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim() !== '') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

module.exports = async (req, res) => {
  // CORS-friendly pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    // ── Ensure table exists (safe for first deploy) ──────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        place_id INT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, place_id)
      )
    `);

    // ── GET: return all favorited place IDs ──────────────────────────────────
    if (req.method === 'GET') {
      const result = await client.query(
        'SELECT place_id FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC',
        [authUser.userId]
      );
      const placeIds = result.rows.map((r) => String(r.place_id));
      return res.status(200).json({ favorites: placeIds });
    }

    const body = await parseJsonBody(req);
    const placeId = parseInt(body.placeId, 10);

    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Valid placeId is required' });
    }

    // Verify place exists
    const placeCheck = await client.query(
      'SELECT id FROM places WHERE id = $1 LIMIT 1',
      [placeId]
    );
    if (placeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // ── POST: add favorite ───────────────────────────────────────────────────
    if (req.method === 'POST') {
      await client.query(
        `INSERT INTO user_favorites (user_id, place_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, place_id) DO NOTHING`,
        [authUser.userId, placeId]
      );
      return res.status(200).json({ favorited: true, placeId });
    }

    // ── DELETE: remove favorite ──────────────────────────────────────────────
    if (req.method === 'DELETE') {
      await client.query(
        'DELETE FROM user_favorites WHERE user_id = $1 AND place_id = $2',
        [authUser.userId, placeId]
      );
      return res.status(200).json({ favorited: false, placeId });
    }
  } catch (error) {
    console.error('Favorites API error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
