const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ text: "SarapBot is not configured properly." });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const { message, history = [] } = req.body;

  const SYSTEM_INSTRUCTION = `
You are SarapBot, the premium culinary concierge for MAPA-Sarap at Angeles University Foundation.
Tone: Warm, friendly, slightly playful, local. Use occasional Kapampangan like "Mangan tana!", "Manyaman!".
Keep responses concise and helpful.
When recommending a restaurant, always end with this exact block:

<div class="chat-actions">
  <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Full Details</a>
  <a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking" target="_blank" class="chat-btn outline">Get Walking Directions</a>
</div>
`;

  // Model priority list (best for free tier → more stable)
  const modelPriority = [
    "gemini-2.5-flash-lite",   // Primary - fastest & cheapest
    "gemini-2.5-flash",        // Fallback
    "gemini-flash-latest"      // Last resort
  ];

  async function tryModel(modelName, attempt = 1) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
          { role: "model", parts: [{ text: "Mangan tana! Ready to help you discover great food at AUF." }] },
          ...history
        ],
      });

      const result = await chat.sendMessage(message);
      return result.response.text();

    } catch (err) {
      console.error(`Model ${modelName} failed (Attempt ${attempt}):`, err?.status || err.message);

      // If it's a 503 (overloaded), retry once with delay
      if ((err?.status === 503 || err?.message?.includes('high demand')) && attempt === 1) {
        await new Promise(r => setTimeout(r, 800)); // 800ms backoff
        return tryModel(modelName, 2);
      }
      throw err;
    }
  }

  // Try models in order
  for (let modelName of modelPriority) {
    try {
      const text = await tryModel(modelName);
      return res.status(200).json({ text });
    } catch (err) {
      // Continue to next model
      continue;
    }
  }

  // === FINAL FALLBACK - Offline mode ===
  console.log("All Gemini models failed → Using offline fallback");
  const fallbackResponses = [
    "Sorry, SarapBot is super busy right now 😅 Try asking me again in 15 seconds!",
    "Mangan tana! I'm having a little siesta. Ask me again shortly!",
    "The kitchen is a bit full at the moment. Try one more time!",
    "I'm temporarily offline but I'll be back soon. What are you craving?"
  ];

  const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  return res.status(200).json({
    text: randomFallback + "<br><br><small>(This is a temporary offline response)</small>"
  });
};