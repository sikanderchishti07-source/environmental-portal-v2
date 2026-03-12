const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;
  
  if (!API_KEY) {
    return res.status(200).json({ reply: "Configuration Error: API Key missing in Vercel settings." });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are AECON's helpful assistant specializing in air quality monitoring and environmental consultancy services in Saudi Arabia."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "Groq API Error: " + (data.error?.message || "Unknown error") });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection failed. Please try again." });
  }
};

module.exports = handler;
