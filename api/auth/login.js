const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body; // 'email' serves as the identifier (Email or Username)

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  try {
    const { rows } = await sql`
      SELECT id, username, email, password_hash, role 
      FROM users 
      WHERE email = ${email} OR username = ${email}
      LIMIT 1
    `;

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'mapa_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: { 
        id: user.id, 
        name: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
} catch (error) {
  console.error("FULL ERROR LOG:", error); // This goes to Vercel Logs
  return res.status(500).json({ 
    error: "Server Crash", 
    details: error.message, 
    stack: error.stack 
  });
}
};