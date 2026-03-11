const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({ reply: "Configuration Error: API Key missing in Vercel settings." });
  }

  try {
    // We use the 'v1beta' endpoint because it is the most compatible with 'gemini-1.5-flash'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
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
      // This will show the exact error message from Google so we can see what's wrong
      res.status(200).json({ reply: "Google API says: " + (data.error?.message || "Unknown error") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection failed. Please check your internet or redeploy." });
  }
};

module.exports = handler;
