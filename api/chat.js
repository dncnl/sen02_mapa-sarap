const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // ✅ Best choice for free tier (fast + good quality)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
  });

  const { message, history = [] } = req.body;

  const SYSTEM_INSTRUCTION = `
You are SarapBot, the premium food concierge for MAPA-Sarap at Angeles University Foundation.
Tone: Warm, friendly, slightly playful, and local. Occasionally use Kapampangan phrases like "Mangan tana!", "Manyaman!", "Kanyaman!".
Keep responses concise but helpful.
When recommending a restaurant, always end with this exact block:

<div class="chat-actions">
  <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Full Details</a>
  <a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking" target="_blank" class="chat-btn outline">Get Walking Directions</a>
</div>
  `;

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Mangan tana! I'm ready to help you find great food around AUF." }] },
        ...history
      ],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({
      text: "Sorry, SarapBot is a bit full right now 😅 Try again in a few seconds!"
    });
  }
};