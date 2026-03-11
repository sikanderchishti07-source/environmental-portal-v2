export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `You are AECON's professional AI assistant for ALEMAD ALARABI Environmental Consultancy in Riyadh, Saudi Arabia. AECON specializes in ambient air quality monitoring, stack emission testing, indoor air quality, EIA/ESIA studies, and environmental compliance (NCEC, WHO, EPA, IFC). Founded 2014, 50+ specialists, 1000+ projects. Contact: enviro@aecon-sa.com | +966 11 512 4979. Be helpful, professional, concise (under 100 words). Encourage contacting AECON for consultations.\n\nUser: ${message}` }] }],
                    generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
                })
            }
        );
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Please contact us at enviro@aecon-sa.com';
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get response' });
    }
}
