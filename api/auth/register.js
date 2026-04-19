const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../_lib/auth');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildUsername(name, email) {
  const fromName = String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (fromName) return fromName.slice(0, 50);
  const fromEmail = normalizeEmail(email).split('@')[0].replace(/[^a-z0-9_]/g, '');
  return (fromEmail || `user_${Date.now()}`).slice(0, 50);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = typeof req.body === 'object' ? req.body : {};
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const baseUsername = buildUsername(name, normalizedEmail);

    let username = baseUsername;
    let attempt = 0;
    while (attempt < 5) {
      const conflict = await client.query('SELECT id FROM users WHERE username = $1', [username]);
      if (conflict.rows.length === 0) break;
      attempt += 1;
      username = `${baseUsername}_${Math.floor(Math.random() * 9999)}`.slice(0, 50);
    }

    const insert = await client.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, username, email, role, created_at`,
      [username, normalizedEmail, hashed]
    );

    const user = insert.rows[0];
    const token = signAuthToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  } finally {
    await client.end();
  }
};
