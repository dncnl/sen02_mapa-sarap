const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sql } = require("@vercel/postgres");

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ text: "SarapBot is not configured yet. Please set GEMINI_API_KEY in Vercel." });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const { message, history = [] } = req.body;

  let contextText = "Database is temporarily unavailable.";

  // Always fetch fresh data (no broken in-memory cache)
  try {
    const result = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.cuisine, 
        p.price_range, 
        p.is_open, 
        p.address,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as avg_rating,
        COUNT(r.id) as review_count,
        STRING_AGG(DISTINCT d.name, ', ') as popular_dishes
      FROM places p
      LEFT JOIN ratings r ON r.place_id = p.id
      LEFT JOIN dishes d ON d.place_id = p.id
      GROUP BY p.id, p.name, p.cuisine, p.price_range, p.is_open, p.address
      ORDER BY avg_rating DESC NULLS LAST
      LIMIT 20;
    `;

    contextText = result.rows.map(p => `
• ${p.name} (${p.cuisine})
  Rating: ${p.avg_rating}★ (${p.review_count} reviews)
  Price: ${p.price_range || 'N/A'} | ${p.is_open ? '✅ Open Now' : '🔴 Closed'}
  Popular dishes: ${p.popular_dishes || 'N/A'}
  Address: ${p.address}
  ID: ${p.id}
    `).join('\n\n');

  } catch (err) {
    console.error("Database error in chat:", err.message);
  }

  const SYSTEM_INSTRUCTION = `
You are SarapBot, the official fun food concierge for MAPA-Sarap at AUF.

REAL RESTAURANTS DATA (only use these):
${contextText}

Rules:
- ONLY recommend places from the list above. Never make up restaurants.
- Be warm, playful, and student-friendly.
- Occasionally say "Mangan tana!" or "Manyaman!".
- Always end every recommendation with this exact HTML:

<div class="chat-actions">
  <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Full Details</a>
</div>
`;

  // Modern models + fallback
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
          { role: "model", parts: [{ text: "Mangan tana! I'm connected to the real database." }] },
          ...history
        ]
      });

      const result = await chat.sendMessage(message);
      return res.status(200).json({ text: result.response.text() });

    } catch (err) {
      console.log(`Model ${modelName} failed:`, err.status || err.message);
      if (err.status !== 503) break;
    }
  }

  // Ultimate fallback
  return res.status(200).json({
    text: "SarapBot is a bit busy right now 😅 Try asking me again in a few seconds!"
  });
};
