export default async function handler(req, res) {
  // 1. Check if the request is a POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // 2. Check if API Key exists
  if (!API_KEY) {
    return res.status(200).json({ reply: "Error: API Key is missing in Vercel settings." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    // 3. Handle the AI response
    if (data.candidates && data.candidates[0]) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiResponse });
    } else {
      // This will tell us if Google sent back an error message
      res.status(200).json({ reply: "Google API Error: " + (data.error?.message || "Unknown error") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection Error: Check your internet or Vercel logs." });
  }
}
