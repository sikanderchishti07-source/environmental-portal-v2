const handler = async (req, res) => {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // 2. Safety check for the API Key
  if (!API_KEY) {
    return res.status(200).json({ reply: "Configuration Error: API Key missing in Vercel." });
  }

  try {
    // 3. Using the STABLE v1 endpoint and the standard gemini-1.5-flash model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    // 4. Send the answer back to your website
    if (data.candidates && data.candidates[0]) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiResponse });
    } else {
      // This helps us see the specific error from Google if it fails
      res.status(200).json({ reply: "Google Error: " + (data.error?.message || "Invalid response") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Check your internet or Vercel logs." });
  }
};

module.exports = handler;
