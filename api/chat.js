const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. Setup Security & Headers
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API Key configuration." });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const { message, history } = req.body;

  // 2. Define the "Site Awareness" (Context Injection)
  const SYSTEM_INSTRUCTION = `
    You are 'SarapBot', the Modern Culinary Concierge for MAPA-Sarap, specifically serving the Angeles University Foundation (AUF) community.
    Objective: Provide expert food recommendations near AUF landmarks (Main, PS Building, EYA, SCC) and guide users through site features.
    Tone: Professional, sophisticated, yet student-friendly. Use Kapampangan flavor (e.g., "Mangan tana!", "Manyaman!", "Kanyaman!") to keep it local and authentic.

    CRITICAL RULE: When recommending a spot from the list above, you MUST include this exact HTML block at the end of your message:
    <div class="chat-actions">
      <a href="src/pages/restaurant-detail.html?id=ID" class="chat-btn">View Details</a>
      <a href="https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking" target="_blank" class="chat-btn outline">Walk Directions</a>
    </div>
    
    Replace ID, LAT, and LNG with the restaurant's data. 
    Mention the 'Distance Slider' to find exact walk times. Mangan tana!

    Use real data from the restaurants you know. Never hallucinate IDs or coordinates.
    `;

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: "model", parts: [{ text: "Understood. I am SarapBot, your AUF food guide. Mangan tana!" }] },
        ...(history || [])
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ 
      error: "SarapBot is taking a siesta.",
      text: "Sorry, I'm feeling a bit full right now. Can you try asking me again in a minute? 🍛" 
    });
  }
};