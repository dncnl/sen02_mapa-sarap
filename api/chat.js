const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sql } = require("@vercel/postgres");

let cachedContext = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ text: "SarapBot is not configured." });

  const genAI = new GoogleGenerativeAI(apiKey);
  const { message, history = [] } = req.body;

  // ================== GET LIVE CONTEXT FROM DB (with cache) ==================
  const now = Date.now();
  if (!cachedContext || now - cacheTimestamp > CACHE_DURATION_MS) {
    try {
      const result = await sql`
        SELECT 
          p.id,
          p.name,
          p.cuisine,
          p.price_range,
          p.is_open,
          p.address,
          p.latitude,
          p.longitude,
          p.opening_hours,
          COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as avg_rating,
          COUNT(r.id) as review_count,
          STRING_AGG(DISTINCT d.name, ' • ') as popular_dishes,
          STRING_AGG(DISTINCT a.amenity, ', ') as amenities
        FROM places p
        LEFT JOIN ratings r ON r.place_id = p.id
        LEFT JOIN dishes d ON d.place_id = p.id
        LEFT JOIN place_amenities a ON a.place_id = p.id
        GROUP BY p.id, p.name, p.cuisine, p.price_range, p.is_open, 
                 p.address, p.latitude, p.longitude, p.opening_hours
        ORDER BY avg_rating DESC NULLS LAST
        LIMIT 25;
      `;

      cachedContext = result.rows.map(place => `
• ${place.name} (${place.cuisine})
  Rating: ${place.avg_rating}★ (${place.review_count} reviews)
  Price: ${place.price_range || 'N/A'} | ${place.is_open ? '✅ Open Now' : '🔴 Closed'}
  Popular dishes: ${place.popular_dishes || 'None listed'}
  Amenities: ${place.amenities || 'None listed'}
  Address: ${place.address}
  ID: ${place.id} | Lat: ${place.latitude}, Lng: ${place.longitude}
      `).join('\n\n');

      cacheTimestamp = now;
      console.log(`✅ Context refreshed - ${result.rows.length} places loaded`);
    } catch (err) {
      console.error("DB Context Error:", err);
      cachedContext = "Database is temporarily unavailable.";
    }
  }

  // ================== SYSTEM PROMPT WITH REAL DATA ==================
  const SYSTEM_INSTRUCTION = `
You are SarapBot, the official premium culinary concierge for MAPA-Sarap at Angeles University Foundation (AUF).

Here is the REAL, up-to-date list of places in the database:

${cachedContext}

CRITICAL RULES:
- ONLY recommend places and dishes that exist in the list above.
- Never invent new restaurants, cafés, or dishes.
- Use real names, ratings, addresses, and amenities.
- When recommending a place, ALWAYS end your message with this exact HTML block:

<div class="chat-actions">
  <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Full Details</a>
  <a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking" target="_blank" class="chat-btn outline">Get Walking Directions</a>
</div>

Personality: Warm, fun, student-friendly, slightly playful. Occasionally use Kapampangan phrases like "Mangan tana!", "Manyaman!", "Kanyaman niyan!".
Be helpful for AUF students (study spots, cheap eats, group meals, open now, etc.).
`;

  // Model fallback
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
          { role: "model", parts: [{ text: "Mangan tana! I'm now connected to the real MAPA-Sarap database." }] },
          ...history
        ]
      });

      const result = await chat.sendMessage(message);
      const text = result.response.text();

      return res.status(200).json({ text });

    } catch (err) {
      console.log(`Model ${modelName} failed:`, err.status || err.message);
      if (err.status === 503) continue;
      break;
    }
  }

  // Ultimate friendly fallback
  return res.status(200).json({
    text: "Sorry, SarapBot is a bit full right now 😅 Try asking me again in a few seconds!"
  });
};