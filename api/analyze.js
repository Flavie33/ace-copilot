export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { messages, system } = req.body;
  const userMessage = messages[0].content;
  const prompt = system + '\n\n' + userMessage;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    }
  );

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Nettoyage agressif
  text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

  // Extraire uniquement le JSON si du texte traîne autour
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];

  // Vérifier que c'est du JSON valide avant de renvoyer
  try {
    JSON.parse(text);
  } catch(e) {
    return res.status(200).json({
      content: [{ text: JSON.stringify({
        analyse: text.substring(0, 200),
        questions: ["Erreur de parsing — voir analyse"],
        objections: [{"objection": "Erreur", "reponse": text.substring(0, 200)}],
        angle: text.substring(0, 200),
        mail: text.substring(0, 200)
      })]
    });
  }

  res.status(200).json({ content: [{ text }] });
}
