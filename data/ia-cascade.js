// Module partagé : cascade multi-API gratuites (Groq -> Gemini -> Mistral)
// Utilisé par Pibody IA (chat) et le Quiz IA (Arcade)

async function callGroq(message) {
  if (!process.env.GROQ_API_KEY) throw new Error('Groq non configuré');
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: message }],
      max_tokens: 800
    })
  });
  if (!r.ok) throw new Error('Erreur Groq');
  const data = await r.json();
  return data.choices[0].message.content;
}

async function callGemini(message) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini non configuré');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
  });
  if (!r.ok) throw new Error('Erreur Gemini');
  const data = await r.json();
  return data.candidates[0].content.parts[0].text;
}

async function callMistral(message) {
  if (!process.env.MISTRAL_API_KEY) throw new Error('Mistral non configuré');
  const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: message }]
    })
  });
  if (!r.ok) throw new Error('Erreur Mistral');
  const data = await r.json();
  return data.choices[0].message.content;
}

async function askCascade(message) {
  const providers = [
    { name: 'Groq', fn: callGroq },
    { name: 'Gemini', fn: callGemini },
    { name: 'Mistral', fn: callMistral }
  ];

  for (const provider of providers) {
    try {
      const reply = await provider.fn(message);
      return { reply, provider: provider.name };
    } catch (err) {
      console.warn(`[IA-CASCADE] ${provider.name} a échoué :`, err.message);
      continue;
    }
  }
  throw new Error("Toutes les IA sont indisponibles (clés API manquantes ou quota dépassé).");
}

module.exports = { askCascade };
