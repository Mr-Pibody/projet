const express = require('express');
const router = express.Router();
const { askCascade } = require('../data/ia-cascade');

router.get('/', (req, res) => {
  res.render('projets/pibody-ia', { title: 'Pibody IA' });
});

router.post('/chat', express.json(), async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message vide.' });

  try {
    const { reply, provider } = await askCascade(message);
    res.json({ success: true, reply, provider });
  } catch (err) {
    res.status(503).json({ error: "Toutes les IA sont indisponibles pour le moment (clés API manquantes ou quota dépassé). Configurez au moins une clé dans l'environnement (GROQ_API_KEY, GEMINI_API_KEY ou MISTRAL_API_KEY)." });
  }
});

module.exports = router;
