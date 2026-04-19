const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../_lib/auth');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = typeof req.body === 'object' ? req.body : {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    let valid = false;

    if (String(user.password_hash || '').startsWith('$2')) {
      valid = await bcrypt.compare(String(password), user.password_hash);
    } else {
      valid = String(password) === String(user.password_hash);
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signAuthToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  } finally {
    await client.end();
  }
};
