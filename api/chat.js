export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // UPDATED URL: Using gemini-1.5-flash-latest on the v1 path
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
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
      // This helps us see if the key is the problem or the model name
      res.status(200).json({ reply: "API says: " + (data.error?.message || "Check API Key in Vercel") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection Error. Please try again." });
  }
}
