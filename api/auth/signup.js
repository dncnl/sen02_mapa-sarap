const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username}`;
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (${username}, ${email}, ${hashedPassword}, 'user')
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
      user: { 
        id: newUser.id, 
        name: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};