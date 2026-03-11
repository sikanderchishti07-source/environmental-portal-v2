export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        role: "user",
                        parts: [{ text: `You are AECON's AI assistant for ALEMAD ALARABI Environmental Consultancy in Riyadh, Saudi Arabia. Be concise (under 100 words). Contact: enviro@aecon-sa.com\n\nUser: ${message}` }] 
                    }]
                })
            }
        );

        const data = await response.json();
        
        // Log to see what Gemini returns
        console.log('Gemini response:', JSON.stringify(data));
        
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text 
            || data?.error?.message
            || 'Please contact us at enviro@aecon-sa.com';
        
        res.status(200).json({ reply });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(200).json({ reply: 'Please contact us at enviro@aecon-sa.com' });
    }
}
