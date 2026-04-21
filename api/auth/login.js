const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const { signAuthToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Destructure inside try-catch to handle potential null req.body
    let body = req.body;
    
    // Manual parsing for environments where req.body might not be automatically parsed
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    
    let { email, password } = body || {};
    // Support legacy 'name' field if email is missing from payload
    if (!email && req.body.name) email = req.body.name;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

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
        name: user.username, // username column stores the Full Name
        username: user.username,
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
