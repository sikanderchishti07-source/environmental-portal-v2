const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  // This looks for the secret key you saved in Vercel
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({ reply: "Configuration Error: GEMINI_API_KEY is missing in Vercel Settings." });
  }

  try {
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
      // This will show us exactly what Google is complaining about
      res.status(200).json({ reply: "AI Error: " + (data.error?.message || "Invalid API Response") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection failed. Please push your code again." });
  }
};

module.exports = handler;
