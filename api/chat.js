const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({ reply: "Configuration Error: API Key missing in Vercel settings." });
  }

  try {
    // UPDATED: Using the full model path 'models/gemini-1.5-flash-latest'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiResponse });
    } else {
      // If it still fails, this will show the exact reason from Google
      res.status(200).json({ reply: "Google API Error: " + (data.error?.message || "Check model settings") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection failed. Please check your internet or redeploy." });
  }
};

module.exports = handler;
