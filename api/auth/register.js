const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Destructure inside try-catch to handle potential null req.body
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email, and Password are required' });
    }

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} OR username = ${name}`;
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email or Name already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === 'admin@example.com' ? 'admin' : 'user';

    const result = await sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, username, email, role
    `;

    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'mapa_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.username, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};