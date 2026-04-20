const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ text: "SarapBot is not configured." });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const { message, history = [] } = req.body;

  const SYSTEM_INSTRUCTION = `
You are SarapBot, the friendly premium food concierge for MAPA-Sarap at AUF.
Tone: Warm, playful, local. Use "Mangan tana!", "Manyaman!", etc. occasionally.
Keep answers short and useful.
Always end restaurant recommendations with this exact HTML:

<div class="chat-actions">
  <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Full Details</a>
  <a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking" target="_blank" class="chat-btn outline">Get Walking Directions</a>
</div>
`;

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
          { role: "model", parts: [{ text: "Mangan tana! Ready to help!" }] },
          ...history
        ]
      });

      const result = await chat.sendMessage(message);
      const text = result.response.text();

      return res.status(200).json({ text });

    } catch (err) {
      console.log(`Model ${modelName} failed:`, err.status || err.message);
      
      // If it's overloaded, try next model immediately
      if (err.status === 503) continue;
      
      // For other errors, break and go to final fallback
      break;
    }
  }

  // === ULTIMATE FALLBACK (Always works) ===
  const fallbacks = [
    "Sorry, SarapBot is super busy right now 😅 Try asking again in 10 seconds!",
    "Mangan tana! The AI kitchen is full. Ask me again shortly!",
    "I'm taking a quick break. Come back in a few seconds!",
    "SarapBot is temporarily offline. Try again soon! 🍛"
  ];

  return res.status(200).json({
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)]
  });
};